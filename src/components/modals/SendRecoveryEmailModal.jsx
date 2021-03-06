import React from 'react';

import { Modal } from 'react-bootstrap';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import ReCAPTCHA from 'react-google-recaptcha';

import { Config } from '../../config';
import { postRecoveryEmail } from '../../requester.js';

const modal = {
    current: 'sendRecoveryEmail',
    next: 'enterRecoveryToken',
}

export default class SendRecoveryEmailModal extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            recoveryEmail: '',
            error: null,
        }

        this.onChange = this.onChange.bind(this);
        this.onSubmit = this.submitEmail.bind(this);
    }

    onChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    submitEmail(captchaToken) {
        const email = {
            email: this.state.recoveryEmail,
        }
        postRecoveryEmail(email, captchaToken).then((res) => {
            if (res.success) {
                this.props.closeModal(modal.current);
                this.props.openModal(modal.next);
            }
            else {
                NotificationManager.warning('Invalid email', 'Email');
            }
        });
    }

    render() {
        return (
            <div>
                <Modal show={this.props.isActive} onHide={e => this.props.closeModal(modal.current, e)} className="modal fade myModal">
                    <Modal.Header>
                        <h1>Recover your password</h1>
                        <button type="button" className="close" onClick={(e) => this.props.closeModal(modal.current, e)}>&times;</button>
                    </Modal.Header>
                    <Modal.Body>
                        {this.state.error !== null ? <div className="error">{this.state.error}</div> : ''}
                        <form onSubmit={(e) => { e.preventDefault(); this.captcha.execute() }}>
                            <div className="form-group">
                                <img src={Config.getValue("basePath") + "images/login-mail.png"} alt="email" />
                                <input type="email" name="recoveryEmail" value={this.state.recoveryEmail} onChange={this.onChange} className="form-control" placeholder="Email address" />
                            </div>

                            <div className="login-sign">
                                <p>Already sent an email? Enter your security <a onClick={(e) => { e.preventDefault(); this.props.closeModal(modal.current); this.props.openModal(modal.next) }}>token</a>.</p>
                            </div>

                            <ReCAPTCHA
                                ref={el => this.captcha = el}
                                size="invisible"
                                sitekey="6LdCpD4UAAAAAPzGUG9u2jDWziQUSSUWRXxJF0PR"
                                onChange={token => this.submitEmail(token)}
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