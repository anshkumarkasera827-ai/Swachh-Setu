# 🌿 SwachhSetu (स्वच्छ सेतु)
### Smart Waste Management Portal • Kanpur Smart City Mission
**Developed by Team HackHives (BCA 1st Sem, Spectrums)**

---

## 🚀 How to Deploy on Vercel (2 Simple Methods)

### Method 1: Using Vercel CLI (Fastest - 1 Command)
1. Open PowerShell or Command Prompt in this folder:
   ```bash
   npx vercel
   ```
2. Log in if prompted, press `Enter` to confirm default options.
3. For production deployment:
   ```bash
   npx vercel --prod
   ```
4. Done! Vercel will give you a live HTTPS URL (e.g., `https://swachhsetu.vercel.app`).

---

### Method 2: Using GitHub (Automatic Continuous Deployment)
1. Initialize git and commit:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of SwachhSetu portal"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Push your code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/swachhsetu.git
   git branch -M main
   git push -u origin main
   ```
4. Go to [vercel.com](https://vercel.com) → Click **"Add New"** → **"Project"**.
5. Select your GitHub repository and click **"Deploy"**.
6. Vercel automatically deploys it in ~20 seconds with free SSL!

---

## 💻 Local Testing
To run locally:
```bash
python -m http.server 8000
```
Open [http://localhost:8000/index.html](http://localhost:8000/index.html) in your browser.
