import React, {FC, Fragment} from 'react';
import classes from './header.module.scss';
import {HeaderProps} from "../../entities/header/header.interfaces";
import {Link} from 'react-router-dom';

const Header: FC<HeaderProps> = props => {
    return (
        <header className={classes.Header}>
            <Link to={props.isAdmin ? '/admin/start-screen' : '/start-screen'} className={classes.logoLink}>
                <img className={classes.logo} src={require('../../images/Logo.svg').default} alt='logo'/>
            </Link>

            { props.children }

            {
                props.isAuthorized
                    ?
                    <Fragment>
                        <Link className={classes.Profile} to={props.isAdmin ? '/admin/profile' : '/profile'}>
                            <img className={classes.Profile} src={require('../../images/Profile.svg').default} alt='Profile' />
                        </Link>
                        <img className={classes.LogOut} src={require('../../images/LogOut.svg').default} alt='LogOut' />
                    </Fragment>
                    : null
            }
        </header>
    );
}

export default Header;