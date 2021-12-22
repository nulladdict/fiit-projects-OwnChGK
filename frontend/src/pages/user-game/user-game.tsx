import React, {FC, useEffect, useState} from 'react';
import classes from './user-game.module.scss';
import PageWrapper from "../../components/page-wrapper/page-wrapper";
import Header from "../../components/header/header";
import {Link, useParams} from 'react-router-dom';
import {CustomInput} from "../../components/custom-input/custom-input";
import {Alert, Snackbar} from "@mui/material";
import {UserGameProps} from "../../entities/user-game/user-game.interfaces";
import {getGame} from '../../server-api/server-api';
import {store} from '../../index';

const UserGame: FC<UserGameProps> = props => {
    const conn = new WebSocket("ws://localhost:80/");
    const {gameId} = useParams<{ gameId: string }>();
    const [answer, setAnswer] = useState('');
    const [gameName, setGameName] = useState('');
    const [questionNumber, setQuestionNumber] = useState(1);

    conn.onopen = function () {
        conn.send(JSON.stringify({
            'cookie': getCookie("authorization"),
        }));
        };

    useEffect(() => {
        fetch(`/users/${gameId}/changeToken`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json'
            }
        });

        getGame(gameId).then((res) => {
            if (res.status === 200) {
                res.json().then(({
                                     name,
                                 }) => {
                    setGameName(name);
                })
            }
        })

    }, []);

    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [timeForAnswer, setTimeForAnswer] = useState(60);

    const changeColor = (progressBar: HTMLDivElement) => {
        if (progressBar.style.width) {
            let width = +(progressBar.style.width).slice(0, -1);
            switch (true) {
                case (width <= 10):
                    progressBar.style.backgroundColor = 'red';
                    break;

                case (width > 11 && width <= 25):
                    progressBar.style.backgroundColor = 'orange';
                    break;

                case (width > 26 && width <= 50):
                    progressBar.style.backgroundColor = 'yellow';
                    break;

                case (width > 51 && width <= 100):
                    progressBar.style.backgroundColor = 'green';
                    break;
            }
        }
    }

    const moveProgressBar = () => {
        const progressBar = document.querySelector('#progress-bar') as HTMLDivElement;

        const frame = () => {
            if (width <= 0) {
                clearInterval(id);
            } else {
                changeColor(progressBar);
                width--;
                setTimeForAnswer(t => t - 0.6);
                progressBar.style.width = width + '%';
            }
        }

        let width = 100;
        const id = setInterval(frame, 60000 / 100); // TODO тут время, если оно не всегда 60 секунд, надо будет подставлять переменную
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setIsSnackbarOpen(false);
    };

    const getCookie = (name: string) => {
        let matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([$?*|{}\[\]\\\/^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    const handleAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAnswer(event.target.value);
    }

    const handleSendButtonClick = () => {
        setIsSnackbarOpen(true);
        conn.send(JSON.stringify({
            'cookie': getCookie("authorization"),
            'action': 'Answer',
            'answer': answer
        }));
    }

    return (
        <PageWrapper>
            <Header isAuthorized={true} isAdmin={false}>
                <Link to='/game' className={`${classes.menuLink} ${classes.ratingLink}`}>Рейтинг</Link>
                <Link to='/game' className={`${classes.menuLink} ${classes.answersLink}`}>Ответы</Link>

                <div className={classes.gameName}>{gameName}</div>
            </Header>

            <div className={classes.contentWrapper}>
                <div className={classes.teamWrapper}>
                    <div className={classes.team}>Команда</div>
                    <div className={classes.teamName}>{store.getState().appReducer.user.team}</div>
                </div>

                <div className={classes.answerWrapper}>
                    <div className={classes.timeLeft}>Осталось: {Math.ceil(timeForAnswer)} сек.</div>

                    <div className={classes.progressBar} id='progress-bar' />
                    <div className={classes.answerBox}>
                        <p className={classes.answerNumber}>Вопрос {questionNumber}</p>

                        <div className={classes.answerInputWrapper}>
                            <CustomInput type='text' id='answer' name='answer' placeholder='Ответ' style={{width: '79%'}} value={answer} onChange={handleAnswer}/>
                            <button className={classes.sendAnswerButton} onClick={handleSendButtonClick} >Отправить</button>
                        </div>
                    </div>
                </div>

                <Snackbar open={isSnackbarOpen} autoHideDuration={6000} onClose={handleClose}>
                    <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                        Ответ успешно сохранен
                    </Alert>
                </Snackbar>
            </div>
        </PageWrapper>
    );
}

export default UserGame;