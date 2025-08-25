#!/bin/bash

# Supabase Setup Script for HR System
# This script helps set up and manage your Supabase project

set -e

echo "🚀 Setting up Supabase for HR System..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

echo "✅ Supabase CLI found"
echo "✅ Config file found"

# Function to check if Supabase is running locally
check_local_supabase() {
    if supabase status &> /dev/null; then
        echo "✅ Local Supabase is running"
        return 0
    else
        echo "❌ Local Supabase is not running"
        return 1
    fi
}

# Function to start local Supabase
start_local_supabase() {
    echo "🔄 Starting local Supabase..."
    supabase start
    echo "✅ Local Supabase started"
}

# Function to stop local Supabase
stop_local_supabase() {
    echo "🔄 Stopping local Supabase..."
    supabase stop
    echo "✅ Local Supabase stopped"
}

# Function to reset local Supabase
reset_local_supabase() {
    echo "🔄 Resetting local Supabase..."
    supabase db reset
    echo "✅ Local Supabase reset"
}

# Function to apply migrations
apply_migrations() {
    echo "🔄 Applying migrations..."
    supabase db reset
    echo "✅ Migrations applied"
}

# Function to generate types
generate_types() {
    echo "🔄 Generating TypeScript types..."
    supabase gen types typescript --local > types/database.types.ts
    echo "✅ TypeScript types generated"
}

# Function to seed database
seed_database() {
    echo "🔄 Seeding database..."
    supabase db reset --db-url postgresql://postgres:postgres@localhost:54322/postgres
    echo "✅ Database seeded"
}

# Main menu
show_menu() {
    echo ""
    echo "📋 Supabase Management Menu:"
    echo "1. Start local Supabase"
    echo "2. Stop local Supabase"
    echo "3. Reset local Supabase"
    echo "4. Apply migrations"
    echo "5. Generate TypeScript types"
    echo "6. Seed database"
    echo "7. Full setup (start + migrate + seed)"
    echo "8. Status check"
    echo "0. Exit"
    echo ""
    read -p "Select an option: " choice
}

# Handle menu selection
handle_choice() {
    case $choice in
        1)
            start_local_supabase
            ;;
        2)
            stop_local_supabase
            ;;
        3)
            reset_local_supabase
            ;;
        4)
            apply_migrations
            ;;
        5)
            generate_types
            ;;
        6)
            seed_database
            ;;
        7)
            echo "🔄 Running full setup..."
            start_local_supabase
            sleep 5  # Wait for services to be ready
            apply_migrations
            seed_database
            echo "✅ Full setup completed!"
            ;;
        8)
            check_local_supabase
            ;;
        0)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please try again."
            ;;
    esac
}

# Check if arguments were passed
if [ $# -eq 0 ]; then
    # Interactive mode
    while true; do
        show_menu
        handle_choice
        echo ""
        read -p "Press Enter to continue..."
    done
else
    # Command line mode
    case $1 in
        start)
            start_local_supabase
            ;;
        stop)
            stop_local_supabase
            ;;
        reset)
            reset_local_supabase
            ;;
        migrate)
            apply_migrations
            ;;
        types)
            generate_types
            ;;
        seed)
            seed_database
            ;;
        setup)
            echo "🔄 Running full setup..."
            start_local_supabase
            sleep 5
            apply_migrations
            seed_database
            echo "✅ Full setup completed!"
            ;;
        status)
            check_local_supabase
            ;;
        *)
            echo "Usage: $0 [start|stop|reset|migrate|types|seed|setup|status]"
            echo "Or run without arguments for interactive mode"
            exit 1
            ;;
    esac
fi
