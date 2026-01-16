// server/utils/templates.js

export const templates = {
  template1: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Lato:wght@400;700&display=swap');
            body { font-family: 'Lato', sans-serif; margin: 0; background-color: #eaf6ff; color: #333; }
            .container { max-width: 800px; margin: 30px auto; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header-table { width: 100%; border-bottom: 4px solid #004a7c; }
            .header-cell-left { padding: 20px 30px; text-align: left; }
            .header-cell-right { padding: 20px 30px; text-align: right; font-size: 14px; color: #555; vertical-align: middle; }
            .logo { width: 150px; height: auto; }
            .title-block { text-align: center; padding: 30px; background-color: #f8f9fa; }
            .title-block h1 { font-family: 'Montserrat', sans-serif; margin: 0; font-size: 36px; color: #004a7c; }
            .content { padding: 30px; }
            .article { border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px; }
            .article:last-child { border-bottom: none; }
            .article img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; }
            .article h2 { font-family: 'Montserrat', sans-serif; font-size: 22px; color: #004a7c; margin: 0 0 10px 0; }
            .article p { font-size: 15px; line-height: 1.7; }
            .read-more-btn { display: inline-block; margin-top: 15px; padding: 10px 15px; background-color: #004a7c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777777; background-color: #f4f4f4; }
            .footer p { margin: 5px 0; }
            .footer a { color: #007bff; text-decoration: none; }
            .social-icons img { width: 24px; height: 24px; margin: 0 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <table class="header-table" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="header-cell-left">
                        <a href="https://innovasolutions.com/"><img src="https://awsmp-logos.s3.amazonaws.com/seller-qtupgm6xylxs6/936bf3405f2ba463c5dc82b485863218.png" alt="Innova Solutions" class="logo"></a>
                    </td>
                    <td class="header-cell-right">{{DATE}}</td>
                </tr>
            </table>
            <div class="title-block">
                <h1>{{TITLE}}</h1>
            </div>
            <div class="content">
                {{ARTICLES_HTML}}
            </div>
            <div class="footer">
                <p>Innova Solutions | GAR, Kokapet</p>
                <p><a href="#">Unsubscribe</a></p>
                <div class="social-icons">
                    <a href="https://x.com/innovasolutions"><img src="https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000" alt="X"></a>
                    <a href="https://www.linkedin.com/company/innova-solutions/"><img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn"></a>
                    <a href="https://www.facebook.com/hashtag/innovasolutions"><img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook"></a>
                </div>
            </div>
        </div>
    </body>
    </html>`,

  template2: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
            body { font-family: 'Roboto', sans-serif; margin: 0; background-color: #121212; color: #e0e0e0; }
            .container { max-width: 800px; margin: 30px auto; background: #1e1e1e; border: 1px solid #333; }
            .header-table { width: 100%; }
            .header-cell-left { padding: 20px 30px; text-align: left; }
            .header-cell-right { padding: 20px 30px; text-align: right; color: #b0b0b0; vertical-align: middle; }
            .logo { width: 150px; height: auto; }
            .swoosh-bar { height: 5px; background: linear-gradient(90deg, #bb86fc, #03dac6); }
            .title-block { text-align: center; padding: 40px 20px; }
            .title-block h1 { font-size: 48px; color: #bb86fc; margin: 0; }
            .content { padding: 30px; }
            .article { margin-bottom: 30px; }
            .article img { max-width: 100%; border-radius: 5px; margin-bottom: 15px; }
            .article h2 { font-size: 24px; color: #bb86fc; margin: 0 0 10px 0; }
            .article p { font-size: 16px; line-height: 1.7; }
            .read-more-btn { display: inline-block; margin-top: 15px; padding: 10px 15px; background-color: #bb86fc; color: #121212; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777; border-top: 1px solid #333; }
            .footer p { margin: 5px 0; }
            .footer a { color: #bb86fc; text-decoration: none; }
            .social-icons img { width: 24px; height: 24px; margin: 0 5px; filter: grayscale(1) brightness(1.5); }
        </style>
    </head>
    <body>
        <div class="container">
            <table class="header-table" border="0" cellpadding="0" cellspacing="0">
                 <tr>
                    <td class="header-cell-left">
                        <a href="https://innovasolutions.com/"><img src="https://awsmp-logos.s3.amazonaws.com/seller-qtupgm6xylxs6/936bf3405f2ba463c5dc82b485863218.png" alt="Innova Solutions" class="logo"></a>
                    </td>
                    <td class="header-cell-right">{{DATE}}</td>
                </tr>
            </table>
            <div class="swoosh-bar"></div>
            <div class="title-block">
                <h1>{{TITLE}}</h1>
            </div>
            <div class="content">
                {{ARTICLES_HTML}}
            </div>
            <div class="footer">
                <p>Innova Solutions | GAR, Kokapet</p>
                <p><a href="#">Unsubscribe</a></p>
                <div class="social-icons">
                    <a href="https://x.com/innovasolutions"><img src="https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000" alt="X"></a>
                    <a href="https://www.linkedin.com/company/innova-solutions/"><img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn"></a>
                    <a href="https://www.facebook.com/hashtag/innovasolutions"><img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook"></a>
                </div>
            </div>
        </div>
    </body>
    </html>`,

  template3: `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Lato:wght@400;700&display=swap');
            body { font-family: 'Lato', sans-serif; margin: 0; background-color: #eaf6ff; color: #333; }
            .container { max-width: 800px; margin: 30px auto; background: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
            .header-table { width: 100%; border-bottom: 4px solid #004a7c; }
            .header-cell-left { padding: 20px 30px; text-align: left; }
            .header-cell-right { padding: 20px 30px; text-align: right; font-size: 14px; color: #555; vertical-align: middle; }
            .logo { width: 150px; height: auto; }
            .title-block { text-align: center; padding: 30px; background-color: #f8f9fa; }
            .title-block h1 { font-family: 'Montserrat', sans-serif; margin: 0; font-size: 36px; color: #004a7c; }
            .content { padding: 30px; }
            .article { border-bottom: 1px solid #e0e0e0; padding-bottom: 20px; margin-bottom: 20px; }
            .article:last-child { border-bottom: none; }
            .article img { max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 15px; }
            .article h2 { font-family: 'Montserrat', sans-serif; font-size: 22px; color: #004a7c; margin: 0 0 10px 0; }
            .article p { font-size: 15px; line-height: 1.7; }
            .read-more-btn { display: inline-block; margin-top: 15px; padding: 10px 15px; background-color: #004a7c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #777777; background-color: #f4f4f4; }
            .footer p { margin: 5px 0; }
            .footer a { color: #007bff; text-decoration: none; }
            .social-icons img { width: 24px; height: 24px; margin: 0 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <table class="header-table" border="0" cellpadding="0" cellspacing="0">
                 <tr>
                    <td class="header-cell-left">
                        <a href="https://innovasolutions.com/"><img src="https://awsmp-logos.s3.amazonaws.com/seller-qtupgm6xylxs6/936bf3405f2ba463c5dc82b485863218.png" alt="Innova Solutions" class="logo"></a>
                    </td>
                    <td class="header-cell-right">{{DATE}}</td>
                </tr>
            </table>
            <div class="title-block">
                <h1>{{TITLE}}</h1>
            </div>
            <div class="content">
                {{ARTICLES_HTML}}
            </div>
            <div class="footer">
                <p>Innova Solutions | GAR, Kokapet</p>
                <p><a href="#">Unsubscribe</a></p>
                <div class="social-icons">
                    <a href="https://x.com/innovasolutions"><img src="https://img.icons8.com/?size=100&id=phOKFKYpe00C&format=png&color=000000" alt="X"></a>
                    <a href="https://www.linkedin.com/company/innova-solutions/"><img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn"></a>
                    <a href="https://www.facebook.com/hashtag/innovasolutions"><img src="https://img.icons8.com/color/48/000000/facebook-new.png" alt="Facebook"></a>
                </div>
            </div>
        </div>
    </body>
    </html>`,
};