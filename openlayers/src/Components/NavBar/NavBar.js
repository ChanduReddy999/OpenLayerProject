import React from 'react';
import { Link } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    return (
        <>
            <div className='navBar'>
                <ul className='navBarUl'>
                    <li className='navBarLi'><a href='https://garudalytics.in/' rel='noreferrer' target='_blank'><img src='https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=500,fit=crop,q=95/Y4LaV7aWNGIJvNZE/Logo-A3QWw5QJoLfRKeBl.png' className='GarudaImage' alt='Garudalytics' /></a></li>
                    <li className='navBarLi'><Link className='navBarLink' to='/'>Home</Link></li>
                    <li className='navBarLi'><Link className='navBarLink' to='/drawshapes'>DrawShapes</Link></li>
                    <li className='navBarLi'><Link className='navBarLink' to='/measures'>Measures</Link></li>
                    <li className='navBarLi'><Link className='navBarLink' to='/layers'>Layers</Link></li>
                    <li className='navBarLi'><Link className='navBarLink' to='/drawlines'>DrawLines</Link></li>
                    <li className='navBarLi'><Link className='navBarLink' to='/drawmultiplelines'>DrawMultipleLines</Link></li>
                </ul>
            </div>
        </>
    )
}

export default NavBar