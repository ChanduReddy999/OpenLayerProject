import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import NavBar from './Components/NavBar/NavBar';
import DrawShapes from './Components/DrawShapes/DrawShapes';
import Home from './Components/Home/Home';
import Measures from './Components/Measures.js/Measures';
import Layers from './Components/Layers/Layers';
import DrawLines from './Components/DrawLines/DrawLines';
import DrawMultipleLines from './Components/DrawMultipleLines/DrawMultipleLines';

const router = createBrowserRouter([
  {
    path:'/',
    element:[<NavBar /> ,<Home />]
  },
  {
    path:'/drawshapes',
    element:<DrawShapes />
  },
  {
    path:'/measures',
    element:<Measures />
  },
  {
    path:'/layers',
    element:<Layers />
  },
  {
    path:'/drawlines',
    element:<DrawLines />
  },
  {
    path:'/drawmultiplelines',
    element:<DrawMultipleLines />
  }
]);

function App() {
  return (
    <>
      <RouterProvider router={router}></RouterProvider>
    </>
  );
}

export default App;
