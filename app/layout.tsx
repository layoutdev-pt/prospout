import './globals.css';
import AppProviders from '@/components/AppProviders';
import SiteFooter from '@/components/SiteFooter';
import Script from 'next/script'

export const metadata = {
  title: 'Growth KPIs App — Commercial Ops',
  description: 'Internal commercial operations dashboard for Layout Agency',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex flex-col relative min-h-[100svh] md:min-h-[100dvh] overflow-x-hidden">
        <Script id="abort-error-silencer" strategy="beforeInteractive">
          {`(function(){
            function isAbortReason(r){
              try{
                var m = String((r && (r.message||r.reason)) || r || '');
                return m.indexOf('Abort') !== -1 || m.indexOf('aborted') !== -1 || m.indexOf('net::ERR_ABORTED') !== -1;
              }catch(e){return false}
            }
            window.addEventListener('error', function(ev){
              var msg = String(ev && ev.message || '');
              if (msg.indexOf('net::ERR_ABORTED') !== -1 || msg.indexOf('Abort') !== -1 || msg.indexOf('aborted') !== -1) {
                ev.preventDefault();
              }
            });
            window.addEventListener('unhandledrejection', function(ev){
              if (isAbortReason(ev && ev.reason)) {
                ev.preventDefault();
              }
            });
            var origError = console.error;
            console.error = function(){
              try{
                var args = Array.prototype.slice.call(arguments);
                var text = args.map(function(a){return typeof a==='string'?a:String(a||'')}).join(' ');
                if (text.indexOf('net::ERR_ABORTED') !== -1 || text.indexOf('Abort') !== -1 || text.indexOf('aborted') !== -1) {
                  return; // swallow aborted fetch logs in dev
                }
              }catch(e){}
              return origError.apply(console, arguments);
            };
          })();`}
        </Script>
        <AppProviders>
          <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            <div className="orb animate-float-slow absolute -top-24 -left-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-cyan-600 to-purple-600" />
            <div className="orb animate-float-slower absolute -bottom-32 -right-24 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-blue-600 to-pink-600" />
            <div className="absolute inset-0 bg-grid animate-grid-pan" />
          </div>
          <main className="flex-1 min-h-[100svh] md:min-h-[100dvh] overflow-x-hidden">{children}</main>
          <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
