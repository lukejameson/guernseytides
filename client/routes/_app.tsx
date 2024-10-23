import { type PageProps } from '$fresh/server.ts';

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>Guernsey Tides</title>
        <link rel='stylesheet' href='../styles.css' />
      </head>
      <body>
        <script>0</script>

        <div class='app-container'>
          <nav class='navbar'>
          </nav>
        </div>
        <Component />
      </body>
    </html>
  );
}
