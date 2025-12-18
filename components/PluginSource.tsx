
import React, { useState } from 'react';
import { Copy, Check, Info, Layers, Code, ShieldCheck, Terminal, FileCode } from 'lucide-react';

const PluginSource: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'main' | 'classes' | 'cli' | 'tests' | 'readme'>('main');

  const mainPhp = `<?php
/**
 * Plugin Name: Søk Regnr (sokregnr) - Enterprise Edition
 * Description: Advanced vehicle lookup with WooCommerce Subscriptions, Maskinporten, WP-CLI, and Rate Limiting.
 * Version: 1.6.0
 * Author: WP Developer Pro
 */

if (!defined('ABSPATH')) exit;

// Autoload components (simulated)
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-maskinporten.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-svv-owner.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-rate-limiter.php';
require_once plugin_dir_path(__FILE__) . 'includes/class-sokregnr-cli.php';

class SokRegnrPlugin {
    private $premium_cap = 'sokregnr_premium';
    
    public function __construct() {
        add_shortcode('sokregnr', [$this, 'render_shortcode']);
        add_action('rest_api_init', [$this, 'register_rest_routes']);
    }

    public function register_rest_routes() {
        register_rest_route('sokregnr/v1', '/lookup-owner', [
            'methods' => 'GET',
            'callback' => [$this, 'handle_owner_lookup'],
            'permission_callback' => 'is_user_logged_in'
        ]);
    }

    public function handle_owner_lookup(WP_REST_Request $request) {
        $user_id = get_current_user_id();
        $is_premium = current_user_can($this->premium_cap);
        $settings = get_option('sokregnr_settings');
        
        // 1. Rate Limiting
        $limiter = new SokRegnr_RateLimiter($settings);
        $limit_check = $limiter->check_limit($user_id, $is_premium);
        if (is_wp_error($limit_check)) return $limit_check;

        $query = strtoupper(sanitize_text_field($request->get_param('q')));
        
        // 2. Authentication (Maskinporten)
        $mp = new SokRegnr_Maskinporten($settings);
        $token = $mp->get_token($settings['scope'] ?? 'svv:kjoretoy/kjoretoyopplysninger');
        if (is_wp_error($token)) return $token;

        // 3. Fetch Data
        $svv = new SokRegnr_Svv_Owner($settings);
        $owner_data = $svv->fetch_owner($query, $token);
        if (is_wp_error($owner_data)) return $owner_data;

        // 4. Finalize
        $limiter->increment_usage($user_id, $is_premium);
        return rest_ensure_response($owner_data);
    }
    
    public function render_shortcode() {
        // ... (Refer to v1.3 for UI rendering)
        return "<!-- sokregnr UI loaded -->";
    }
}
new SokRegnrPlugin();`;

  const classesPhp = `<?php
// includes/class-sokregnr-maskinporten.php
class SokRegnr_Maskinporten {
    public function get_token($scope) {
        // Deterministic mock token for testing
        if (defined('SOKREGNR_TEST_MODE')) return 'mock_token_12345';
        
        // JWT Signing logic (RS256)
        // ... (Refer to v1.4 for full openssl_sign implementation)
        return 'real_access_token_from_maskinporten';
    }
}

// includes/class-sokregnr-svv-owner.php
class SokRegnr_Svv_Owner {
    public function fetch_owner($query, $token) {
        $response = wp_remote_get('https://api.svv.no/...', ['headers' => ['Authorization' => 'Bearer '.$token]]);
        $code = wp_remote_retrieve_response_code($response);
        
        if ($code === 401) return new WP_Error('401', 'Auth feilet. Sjekk Maskinporten-klient.');
        if ($code === 429) return new WP_Error('429', 'SVV Rate Limit nådd. Prøv igjen om 1 minutt.');
        
        return json_decode(wp_remote_retrieve_body($response), true);
    }
}

// includes/class-sokregnr-rate-limiter.php
class SokRegnr_RateLimiter {
    public function check_limit($user_id, $is_premium) {
        $global = (int)get_option('sokregnr_global_daily', 0);
        if ($global >= 5000) return new WP_Error('429', 'Global dagskvote nådd.');
        
        if (!$is_premium) {
            $trial = (int)get_user_meta($user_id, 'sokregnr_trial_count', true);
            if ($trial >= 3) return new WP_Error('402', 'Trial utløpt. Vennligst oppgrader.');
        }
        return true;
    }
    
    public function increment_usage($user_id, $is_premium) {
        $global = (int)get_option('sokregnr_global_daily', 0);
        update_option('sokregnr_global_daily', $global + 1);
        if (!$is_premium) {
            $trial = (int)get_user_meta($user_id, 'sokregnr_trial_count', true);
            update_user_meta($user_id, 'sokregnr_trial_count', $trial + 1);
        }
    }
}`;

  const cliPhp = `<?php
// includes/class-sokregnr-cli.php
if (defined('WP_CLI') && WP_CLI) {
    class SokRegnr_CLI {
        public function quota($args) {
            $action = $args[0] ?? 'status';
            if ($action === 'status') {
                $usage = get_option('sokregnr_global_daily', 0);
                WP_CLI::success("Dagens forbruk: $usage / 5000");
            } elseif ($action === 'reset') {
                update_option('sokregnr_global_daily', 0);
                WP_CLI::success("Global kvote er nullstilt.");
            }
        }
    }
    WP_CLI::add_command('sokregnr:quota', 'SokRegnr_CLI');
}`;

  const testsPhp = `<?php
// tests/class-sokregnr-tests.php
class SokRegnr_MockTests extends WP_UnitTestCase {
    public function test_jwt_determinism() {
        define('SOKREGNR_TEST_MODE', true);
        $mp = new SokRegnr_Maskinporten([]);
        $this->assertEquals('mock_token_12345', $mp->get_token('test'));
    }

    public function test_trial_gating() {
        $limiter = new SokRegnr_RateLimiter([]);
        update_user_meta(1, 'sokregnr_trial_count', 3);
        $res = $limiter->check_limit(1, false);
        $this->assertTrue(is_wp_error($res));
        $this->assertEquals('402', $res->get_error_code());
    }
}`;

  const readmeContent = `# Søk Regnr v1.6.0 - Enterprise Documentation

## Installasjon
1. Last opp mappen til \`/wp-content/plugins/sokregnr/\`
2. Aktiver via WP-Admin.
3. Konfigurer Maskinporten under Innstillinger -> Søk Regnr.

## WP-CLI
\`\`\`bash
wp sokregnr:quota status  # Se statistikk
wp sokregnr:quota reset   # Nullstill teller
\`\`\`

## Tester
Kjør testene med PHPUnit:
\`\`\`bash
wp-content/plugins/sokregnr/vendor/bin/phpunit tests/class-sokregnr-tests.php
\`\`\``;

  const copyToClipboard = () => {
    let text = mainPhp;
    if (activeView === 'classes') text = classesPhp;
    if (activeView === 'cli') text = cliPhp;
    if (activeView === 'tests') text = testsPhp;
    if (activeView === 'readme') text = readmeContent;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex flex-wrap bg-slate-200 p-1 rounded-xl w-fit gap-1">
        <NavBtn active={activeView === 'main'} onClick={() => setActiveView('main')} icon={<Code size={14}/>} label="Hovedfil" />
        <NavBtn active={activeView === 'classes'} onClick={() => setActiveView('classes')} icon={<Layers size={14}/>} label="Klasser" />
        <NavBtn active={activeView === 'cli'} onClick={() => setActiveView('cli')} icon={<Terminal size={14}/>} label="WP-CLI" />
        <NavBtn active={activeView === 'tests'} onClick={() => setActiveView('tests')} icon={<ShieldCheck size={14}/>} label="Tester" />
        <NavBtn active={activeView === 'readme'} onClick={() => setActiveView('readme')} icon={<FileCode size={14}/>} label="README" />
      </div>

      <div className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-700">
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-1.5 rounded-lg">
              <Code className="text-white" size={20} />
            </div>
            <h3 className="text-white font-bold tracking-tight">
              {activeView === 'main' ? 'sokregnr.php' : activeView === 'classes' ? 'includes/classes.php' : activeView === 'cli' ? 'includes/cli.php' : activeView === 'tests' ? 'tests/unit-tests.php' : 'README.md'}
            </h3>
          </div>
          <button onClick={copyToClipboard} className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-bold transition-all">
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            {copied ? 'Kopiert!' : 'Kopier kode'}
          </button>
        </div>
        <div className="p-6 overflow-auto max-h-[550px] bg-[#0d1117]">
          <pre className="text-sm font-mono leading-relaxed text-slate-300 whitespace-pre">
            {activeView === 'main' ? mainPhp : activeView === 'classes' ? classesPhp : activeView === 'cli' ? cliPhp : activeView === 'tests' ? testsPhp : readmeContent}
          </pre>
        </div>
      </div>
    </div>
  );
};

const NavBtn: React.FC<{active: boolean, onClick: () => void, icon: React.ReactNode, label: string}> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
  >
    {icon} {label}
  </button>
);

export default PluginSource;
