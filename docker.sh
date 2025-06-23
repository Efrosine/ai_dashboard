#!/bin/bash

# AI Dashboard Docker Management Script

echo "🤖 AI Dashboard Docker Management"
echo "=================================="

case "$1" in
  "start"|"up")
    echo "🚀 Starting AI Dashboard containers..."
    docker compose up -d
    echo "✅ Containers started!"
    echo ""
    echo "📊 Service URLs:"
    echo "   Frontend: http://localhost:80"
    echo "   API: http://localhost:3000"
    echo "   WebSocket: ws://localhost:8080"
    echo "   MySQL: localhost:3306"
    echo ""
    echo "📝 To view logs: ./docker.sh logs"
    echo "📝 To stop: ./docker.sh stop"
    ;;
    
  "stop"|"down")
    echo "🛑 Stopping AI Dashboard containers..."
    docker compose down
    echo "✅ Containers stopped!"
    ;;
    
  "restart")
    echo "🔄 Restarting AI Dashboard containers..."
    docker compose down
    docker compose up -d
    echo "✅ Containers restarted!"
    ;;
    
  "logs")
    echo "📋 Showing container logs..."
    docker compose logs -f
    ;;
    
  "status")
    echo "📊 Container status:"
    docker compose ps
    ;;
    
  "build")
    echo "🔨 Building containers..."
    docker compose build
    echo "✅ Build complete!"
    ;;
    
  "clean")
    echo "🧹 Cleaning up containers and volumes..."
    docker compose down -v
    docker system prune -f
    echo "✅ Cleanup complete!"
    ;;
    
  "shell")
    echo "🐚 Opening shell in server container..."
    docker compose exec server bash
    ;;
    
  "mysql")
    echo "🗄️ Opening MySQL shell..."
    docker compose exec mysql mysql -u${MYSQL_USER:-dashboard_user} -p${MYSQL_PASSWORD:-dashboard_pass123} ${MYSQL_DATABASE:-ai_dashboard}
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|logs|status|build|clean|shell|mysql}"
    echo ""
    echo "Commands:"
    echo "  start   - Start all containers"
    echo "  stop    - Stop all containers"
    echo "  restart - Restart all containers"
    echo "  logs    - Show container logs"
    echo "  status  - Show container status"
    echo "  build   - Build containers"
    echo "  clean   - Clean up containers and volumes"
    echo "  shell   - Open shell in server container"
    echo "  mysql   - Open MySQL shell"
    exit 1
    ;;
esac
