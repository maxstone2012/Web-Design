import React from 'react';

import { Modal } from 'react-bootstrap';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import ReCAPTCHA from 'react-google-recaptcha';

import { Config } from '../../config';
import { postNewPassword } from '../../requester.js';

const modal = {
    current: 'changePassword',
    next: 'showLoginModal',
}

export default class ChangePasswordModal extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            password: '',
            error: null,
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.submitPassword.bind(this);
    }


    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    submitPassword(captchaToken) {
        if (this.state.password !== this.state.confirmPassword) {
            NotificationManager.warning('Passwords don\'t match', 'Password');
            this.captcha.reset();
            return;
        }

        if (this.state.password.length < 6) {
            NotificationManager.warning('Should be at least 6 characters long, containing characters and digits', 'Password');
            this.captcha.reset();
            return;
        }
        
        const postObj = {
            token: this.props.recoveryToken,
            password: this.state.password,
        }

        postNewPassword(postObj, captchaToken).then((res) => {
            if (res.success) {
                this.props.closeModal(modal.current);
                this.props.openModal(modal.next);
                NotificationManager.success('Successfully changed', 'Password');
            }
            else {
                NotificationManager.warning('Not found', '404');
                this.captcha.reset();
            }
        });
    }

    render() {
        return (
            <div>
                <Modal show={this.props.isActive} onHide={e => this.props.closeModal(modal.current, e)} className="modal fade myModal">
                    <Modal.Header>
                        <h1>Recover your password (3)</h1>
                        <button type="button" className="close" onClick={(e) => this.props.closeModal(modal.current, e)}>&times;</button>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.error !== null ? <div className="error">{this.state.error}</div> : ''}
                        <form onSubmit={(e) => { e.preventDefault(); this.captcha.execute() }}>
                            <div className="form-group">
                                <img src={Config.getValue("basePath") + "images/login-mail.png"} alt="email" />
                                <input type="password" name="password" value={this.state.password} onChange={this.onChange} className="form-control" placeholder="New password" />
                            </div>

                            <div className="form-group">
                                <img src={Config.getValue("basePath") + "images/login-mail.png"} alt="email" />
                                <input type="password" name="confirmPassword" value={this.state.confirmPassword} onChange={this.onChange} className="form-control" placeholder="Confirm password" />
                            </div>

                            <ReCAPTCHA
                                ref={el => this.captcha = el}
                                size="invisible"
                                sitekey="6LdCpD4UAAAAAPzGUG9u2jDWziQUSSUWRXxJF0PR"
                                onChange={token => this.submitPassword(token)}
                            />

                            <button type="submit" className="btn btn-primary">Send email</button>
                            <div className="clearfix"></div>
                        </form>
                    </Modal.Body>
                </Modal>
                <NotificationContainer />
            </div>
        );
    }
}