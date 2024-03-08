import React from 'react';
import classes from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={classes.footer}>
            <div className={classes.footerText}>
                <p>© 2024 <a href="https://www.linkedin.com/in/kristiina-salmi-3a5549194/">Kristiina Salmi</a>. Check out the full code on my <a href="https://github.com/krsalmi/ai_digits_frontend">Github</a></p>
            </div>
        </footer>
    );
}

export default Footer;
