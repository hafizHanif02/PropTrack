# Contributing to PropTrack

Thank you for your interest in contributing to PropTrack! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Test your changes thoroughly
6. Submit a pull request

## 🏗️ Development Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git

### Setup Instructions
1. Follow the installation instructions in the main README.md
2. Ensure both backend and frontend servers are running
3. Run the seed script to populate test data

## 📝 Code Style

### JavaScript/React
- Use ES6+ features
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling
- Add meaningful comments for complex logic

### Git Commit Messages
Follow the conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Example: `feat: add property search functionality`

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 📋 Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Add comments where necessary
   - Follow existing code patterns

3. **Test Your Changes**
   - Ensure all existing tests pass
   - Add new tests for new functionality
   - Test both frontend and backend

4. **Update Documentation**
   - Update README if needed
   - Add API documentation for new endpoints
   - Update comments in code

5. **Submit Pull Request**
   - Write a clear title and description
   - Reference any related issues
   - Include screenshots for UI changes

## 🐛 Bug Reports

When reporting bugs, please include:
- Operating system and version
- Node.js version
- MongoDB version
- Steps to reproduce the issue
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Feature Requests

For feature requests, please:
- Check existing issues first
- Describe the feature clearly
- Explain the use case
- Consider the impact on existing functionality

## 🔧 Development Guidelines

### API Development
- Follow RESTful conventions
- Use proper HTTP status codes
- Implement proper error handling
- Add input validation
- Document new endpoints

### Frontend Development
- Use Material-UI components consistently
- Implement responsive design
- Add loading states
- Handle errors gracefully
- Use Redux for state management

### Database
- Use proper MongoDB indexes
- Validate data schemas
- Handle database errors
- Consider performance implications

## 📚 Resources

- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Material-UI Documentation](https://mui.com)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines

## 📞 Getting Help

If you need help:
- Check the README.md first
- Look at existing issues
- Ask questions in pull requests
- Contact the maintainers

Thank you for contributing to PropTrack! 🏠✨ 