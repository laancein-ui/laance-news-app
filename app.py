import os
from flask import Flask, render_template
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Initialize Supabase Client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if supabase_url and supabase_key:
    supabase: Client = create_client(supabase_url, supabase_key)
else:
    supabase = None
    print("Warning: Supabase credentials not found. Set SUPABASE_URL and SUPABASE_KEY in .env")

@app.route("/")
def home():
    # Example of fetching products from Supabase
    products = []
    if supabase:
        try:
            response = supabase.table("products").select("*").execute()
            products = response.data
        except Exception as e:
            print(f"Error fetching from Supabase: {e}")
    
    return render_template("home.html", products=products)

@app.route("/safety")
def safety():
    return render_template("safety.html")

@app.route("/tools")
def tools():
    return render_template("tools.html")

if __name__ == "__main__":
    # Render requires binding to 0.0.0.0
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
