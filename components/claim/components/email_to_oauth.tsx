// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {emailToOAuth} from 'actions/admin_actions.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';
import LoginMfa from 'components/login/login_mfa.jsx';
import LocalizedInput from 'components/localized_input/localized_input';
import { boolean } from '@storybook/addon-knobs';

type Props = {
    newType?: any,
    email?: any,
    siteName?: string,
};

export type State = {
    showMfa?: boolean,
    password?: string,
    error?: string,
};

export default class EmailToOAuth extends React.PureComponent <Props, State> {
    private passwordInput: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);

        this.passwordInput = React.createRef();
    }

    getDefaultState() {
        return {
            error: '',
        };
    }

    preSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        const state = this.getDefaultState();

        var password = this.passwordInput.current && this.passwordInput.current.value;
        if (!password) {
            state.error = Utils.localizeMessage('claim.email_to_oauth.pwdError', 'Please enter your password.');
            this.setState(state);
            return;
        }

        this.setState({password});

        // state.error = null;
        this.setState(state);

        this.submit(this.props.email, password, '');
    }

    submit = (loginId: string, password: string, token: string) => {
        emailToOAuth(
            loginId,
            password,
            token,
            this.props.newType,
            (data: { follow_link: string; }) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err: { server_error_id: string; message: any; }) => {
                if (!this.state.showMfa && err.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    this.setState({showMfa: true});
                } else {
                    this.setState({error: err.message, showMfa: false});
                }
            },
        );
    }

    render() {
        var error = null;
        if (this.state.error) {
            error = <div className='form-group has-error'><label className='control-label'>{this.state.error}</label></div>;
        }

        var formClass = 'form-group';
        if (error) {
            formClass += ' has-error';
        }

        const type = (this.props.newType === Constants.SAML_SERVICE ? Constants.SAML_SERVICE.toUpperCase() : Utils.toTitleCase(this.props.newType));
        const uiType = `${type} SSO`;

        let content;
        if (this.state.showMfa) {
            content = (
                <LoginMfa
                    loginId={this.props.email}
                    password={this.state.password}
                    submit={this.submit}
                />
            );
        } else {
            content = (
                <form onSubmit={this.preSubmit}>
                    <p>
                        <FormattedMessage
                            id='claim.email_to_oauth.ssoType'
                            defaultMessage='Upon claiming your account, you will only be able to login with {type} SSO'
                            values={{
                                type,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='claim.email_to_oauth.ssoNote'
                            defaultMessage='You must already have a valid {type} account'
                            values={{
                                type,
                            }}
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='claim.email_to_oauth.enterPwd'
                            defaultMessage='Enter the password for your {site} account'
                            values={{
                                site: this.props.siteName,
                            }}
                        />
                    </p>
                    <div className={formClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='password'
                            ref={this.passwordInput}
                            placeholder={{id: t('claim.email_to_oauth.pwd'), defaultMessage: 'Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {error}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='claim.email_to_oauth.switchTo'
                            defaultMessage='Switch Account to {uiType}'
                            values={{
                                uiType,
                            }}
                        />
                    </button>
                </form>
            );
        }

        return (
            <div>
                <h3>
                    <FormattedMessage
                        id='claim.email_to_oauth.title'
                        defaultMessage='Switch Email/Password Account to {uiType}'
                        values={{
                            uiType,
                        }}
                    />
                </h3>
                {content}
            </div>
        );
    }
}
