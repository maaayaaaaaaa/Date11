# Болзох уу? 🥰 — Minimal Date Invitation

A phone-friendly, centered date invitation for GitHub Pages. Her responses go to your Formspree email notification.

### Changes in this version
- Removed **The Medium (2021)** and **Noise (2024)**, leaving six movie choices with the supplied posters.
- Movies are independent checkboxes: she can select **as many as she wants**. A movie summary appears after choosing a poster.
- The optional **Сонирхолтой кино алга :(** choice allows her to type a movie instead. Selecting it clears poster selections, and choosing any poster clears it.
- The four activities now have emojis and clearer active styling.
- Mongolia-local time options run **18:00 through 22:00**, every 30 minutes, plus **Одоохондоо хэлж мэдэхгүй байна**. Japan time updates by one hour.
- Her full movie selection (or custom movie) is included in the Formspree email.

### Publish to GitHub Pages
1. Upload `index.html`, `style.css`, `script.js`, and the whole `posters/` folder to your repository root.
2. Enable **Settings → Pages → Deploy from a branch → main / root** if you have not already.
3. Open the published website on a phone and send a **test submission**, then check the Formspree recipient Gmail and spam folder.

### Formspree
Configured endpoint: `https://formspree.io/f/xaeebzvo`. No Gmail password or API secret is present in the code. Success is shown **only** if Formspree returns HTTP success. Real delivery has not been tested here.

### Preview
`preview.html` embeds its CSS, JS, and posters in one file for easy local viewing, and its submit button is **live** (it will attempt to send to Formspree).
