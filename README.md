# Matrix Meets Vector 🧮✨

An interactive 3D linear algebra visualization platform that brings matrices and vectors to life! Transform abstract mathematical concepts into engaging visual experiences, inspired by the educational philosophy of 3Blue1Brown.

![Matrix Meets Vector](client/public/favicon.png)

## ✨ Features

- **Interactive 3D Visualization**: Drag and manipulate vectors in real-time 3D space
- **Matrix Transformations**: Apply linear transformations and watch vectors transform before your eyes
- **Real-time Analysis**: Get instant feedback on vector properties, angles, and relationships
- **Eigenvalue Decomposition**: Visualize eigenvectors and eigenvalues for square matrices
- **Singular Value Decomposition**: Understand matrix rank and principal components
- **Matrix Classification**: Automatic detection of special matrix types (diagonal, symmetric, orthogonal, etc.)
- **Mathematical Expression Support**: Use fractions, powers, and mathematical expressions in inputs
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🎯 Educational Goals

This tool helps students and educators:
- Build intuitive understanding of linear transformations
- Visualize the geometric meaning of matrix operations
- Explore eigenspaces and principal component analysis
- Understand how matrices transform vector spaces
- Connect abstract algebra concepts to visual geometry

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd matrix-meets-vector
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000` to start exploring!

## 🏗️ Project Structure

```
matrix-meets-vector/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # UI component library
│   │   │   ├── Vector.tsx  # 3D vector rendering
│   │   │   ├── VectorScene.tsx # Main 3D scene
│   │   │   ├── MatrixInput.tsx # Matrix input interface
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── stores/     # Zustand state management
│   │   │   ├── math.ts     # Mathematical computations
│   │   │   └── utils.ts    # Utility functions
│   │   └── pages/          # Application pages
│   ├── public/             # Static assets
│   └── index.html          # Main HTML template
├── server/                 # Backend Express server
├── shared/                 # Shared types and schemas
└── README.md
```

## 🎮 How to Use

### Basic Vector Operations

1. **Add Vectors**: Use the Vector Input panel to create new vectors
2. **Drag Vectors**: Click and drag vector endpoints to move them in 3D space
3. **Transform Vectors**: Set up transformation matrices and watch vectors change
4. **Analyze Results**: View detailed analysis of vector properties and relationships

### Matrix Transformations

1. **Choose Matrix Dimension**: Select 2×2, 2×3, 3×2, or 3×3 matrices
2. **Enter Values**: Use mathematical expressions like `1/2`, `sqrt(2)`, or `2^3`
3. **Apply Transformation**: Watch your vectors transform in real-time
4. **Explore Properties**: View eigenvalues, eigenvectors, and singular values

### Advanced Features

- **Matrix Visualization**: Toggle dimension visualization to see transformation spaces
- **Vector Analysis**: Compare original and transformed vectors
- **Mathematical Expressions**: Use complex expressions in matrix and vector inputs
- **Export/Import**: Save and load your mathematical explorations

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Three.js, React Three Fiber
- **3D Graphics**: Three.js for WebGL rendering
- **State Management**: Zustand for reactive state management
- **UI Components**: Radix UI components with Tailwind CSS
- **Math Processing**: Custom mathematical expression parser
- **Backend**: Express.js with TypeScript
- **Build Tool**: Vite for fast development and building

## 📚 Mathematical Concepts Covered

- **Linear Transformations**: Scaling, rotation, reflection, shearing
- **Vector Spaces**: 2D and 3D vector operations and properties
- **Matrix Operations**: Multiplication, determinants, traces
- **Eigendecomposition**: Eigenvalues and eigenvectors
- **Singular Value Decomposition**: Matrix rank and principal components
- **Matrix Classification**: Identity, diagonal, symmetric, orthogonal matrices

## 🎨 Customization

The application supports various customization options:

- **Vector Colors**: Automatic color assignment with customizable palettes
- **Mathematical Expressions**: Full expression parsing for complex inputs
- **Visualization Modes**: Toggle between different rendering styles
- **Analysis Depth**: Choose from basic to advanced mathematical analysis

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the existing code style and patterns
4. **Add tests**: Ensure your changes work correctly
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Describe your changes and their benefits

### Development Guidelines

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Write clear, documented code
- Test mathematical computations thoroughly
- Ensure responsive design across devices

## 📖 Educational Resources

This project is inspired by:
- **3Blue1Brown**: Essence of Linear Algebra series
- **Interactive Mathematics**: Visual learning approaches
- **Mathematical Visualization**: Making abstract concepts tangible

## 🐛 Troubleshooting

### Common Issues

**Vectors not appearing?**
- Check browser WebGL support
- Ensure proper vector dimensions
- Verify mathematical expressions are valid

**Matrix transformations not working?**
- Confirm matrix dimensions match vector dimensions
- Check for numerical stability in matrix values
- Verify mathematical expressions parse correctly

**Performance issues?**
- Reduce the number of active vectors
- Close unnecessary browser tabs
- Check system WebGL capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **3Blue1Brown** for inspiring visual mathematics education
- **Three.js community** for powerful 3D graphics capabilities
- **React Three Fiber** for seamless React-Three.js integration
- **Educational mathematics community** for feedback and inspiration

---

**Happy Learning!** 🎓 Transform your understanding of linear algebra, one vector at a time.

For questions, suggestions, or educational collaborations, feel free to open an issue or reach out to the community!