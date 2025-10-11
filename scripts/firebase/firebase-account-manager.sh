#!/bin/bash

echo "🎓 Iqra School Management - Firebase Account Change"
echo "=================================================="
echo ""
echo "👤 Teacher Account: mdlavlusheikh220@gmail.com"
echo "🏫 School: Iqra Mukari Academy"
echo ""

# Function to check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        echo "❌ Firebase CLI not found!"
        echo "Please install it first: npm install -g firebase-tools"
        exit 1
    fi
}

# Function to show current status
show_current_status() {
    echo "🔍 Current Firebase Status:"
    echo "=========================="
    
    current_project=$(firebase use --current 2>/dev/null | grep "Active project" | cut -d' ' -f3)
    if [ -n "$current_project" ]; then
        echo "✅ Active project: $current_project"
    else
        echo "❌ No active Firebase project"
    fi
    
    # Check if user is logged in
    if firebase projects:list &> /dev/null; then
        echo "✅ Logged in to Firebase"
        echo ""
        echo "Available projects:"
        firebase projects:list
    else
        echo "❌ Not logged in to Firebase"
    fi
    echo ""
}

# Main menu
show_menu() {
    echo "Choose an option:"
    echo "1. Change Firebase account (logout & login)"
    echo "2. Switch to different project"
    echo "3. Deploy security rules"
    echo "4. Check environment variables"
    echo "5. Show setup instructions"
    echo "6. Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
}

# Process menu choice
process_choice() {
    case $choice in
        1)
            echo ""
            echo "🔄 Changing Firebase Account..."
            echo "=============================="
            echo "Step 1: Logging out from current account..."
            firebase logout
            echo ""
            echo "Step 2: Logging in with new account..."
            firebase login
            echo ""
            echo "✅ Account changed! Now select a project:"
            firebase projects:list
            echo ""
            read -p "Enter project ID to use: " project_id
            firebase use "$project_id"
            ;;
        2)
            echo ""
            echo "📋 Available Projects:"
            echo "====================="
            firebase projects:list
            echo ""
            read -p "Enter project ID to switch to: " project_id
            firebase use "$project_id"
            ;;
        3)
            echo ""
            echo "🛡️ Deploying Security Rules..."
            echo "=============================="
            echo "Deploying Firestore rules..."
            firebase deploy --only firestore:rules
            echo ""
            echo "Deploying Storage rules..."
            firebase deploy --only storage
            echo ""
            echo "✅ Security rules deployed!"
            ;;
        4)
            echo ""
            echo "🔧 Environment Variables Check:"
            echo "==============================="
            if [ -f ".env.local" ]; then
                echo "✅ .env.local file found"
                echo ""
                echo "Current configuration:"
                grep "NEXT_PUBLIC_FIREBASE" .env.local | head -6
                echo ""
                echo "⚠️  Make sure to update these with your new Firebase project values!"
            else
                echo "❌ .env.local file not found!"
                echo "Please create it with your Firebase configuration."
            fi
            ;;
        5)
            echo ""
            echo "📖 Setup Instructions:"
            echo "======================"
            echo "1. Change Firebase account (option 1)"
            echo "2. Update .env.local with new Firebase config"
            echo "3. Deploy security rules (option 3)"
            echo "4. Create teacher account in Firebase console:"
            echo "   - Email: mdlavlusheikh220@gmail.com"
            echo "   - Password: demo123"
            echo "5. Create user document in Firestore (see TEACHER_ACCOUNT_SETUP.md)"
            echo "6. Test login in your application"
            echo ""
            echo "📋 Important files to reference:"
            echo "- TEACHER_ACCOUNT_SETUP.md - Detailed teacher account setup"
            echo "- FIREBASE_CHANGE_CHECKLIST.md - Complete checklist"
            echo "- firestore.rules - Security rules"
            ;;
        6)
            echo ""
            echo "👋 Goodbye! Remember to:"
            echo "- Update your .env.local file"
            echo "- Set up your teacher account: mdlavlusheikh220@gmail.com"
            echo "- Test the application after changes"
            exit 0
            ;;
        *)
            echo "❌ Invalid choice. Please try again."
            ;;
    esac
}

# Main script execution
main() {
    check_firebase_cli
    show_current_status
    
    while true; do
        show_menu
        process_choice
        echo ""
        echo "Press Enter to continue..."
        read
        clear
        show_current_status
    done
}

# Run the script
main