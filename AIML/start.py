import sys
import os
from utils.groq_client import GroqClient


def check_dependencies():
    """Check if all required packages are installed"""
    required_packages = [
        "langchain",
        "langchain_groq",
        "langgraph",
        "dotenv",
        "colorama",
    ]

    missing_packages = []

    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            if package == "dotenv":
                missing_packages.append("python-dotenv")
            else:
                missing_packages.append(package)

    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Install missing packages with:")
        print(f"pip install {' '.join(missing_packages)}")
        return False

    print("✅ All required packages are installed")
    return True


def check_env_file():
    """Check if .env file exists and has required variables"""
    if not os.path.exists(".env"):
        print("❌ .env file not found")
        print("📝 Create a .env file with:")
        print("GROQ_API_KEY=your_groq_api_key_here")
        print("\n🔑 Get your free API key from: https://console.groq.com")
        return False

    # Check if GROQ_API_KEY exists in .env
    with open(".env", "r") as f:
        content = f.read()
        if "GROQ_API_KEY" not in content or "your_groq_api_key_here" in content:
            print("❌ GROQ_API_KEY not properly set in .env file")
            print("🔑 Get your free API key from: https://console.groq.com")
            print("📝 Add it to .env file: GROQ_API_KEY=your_actual_key")
            return False

    print("✅ Environment file configured")
    return True


def test_groq_connection():
    """Test connection to Groq API"""
    try:
        client = GroqClient()
        success, message = client.test_connection()

        if success:
            print("✅ Groq API connection successful")
            return True
        else:
            print(f"❌ Groq API connection failed: {message}")
            return False

    except Exception as e:
        print(f"❌ Failed to initialize Groq client: {str(e)}")
        return False


def main():
    print("🏥 Medical AI Bot - System Check")
    print("=" * 50)

    # Check all requirements
    checks = [
        ("Dependencies", check_dependencies),
        ("Environment", check_env_file),
        ("API Connection", test_groq_connection),
    ]

    all_passed = True

    for check_name, check_func in checks:
        print(f"\n🔍 Checking {check_name}...")
        if not check_func():
            all_passed = False

    print("\n" + "=" * 50)

    if all_passed:
        print("🎉 All checks passed! System ready to run.")
        print("🚀 Run the medical bot with: python main.py")
    else:
        print("❌ Some checks failed. Please fix the issues above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
