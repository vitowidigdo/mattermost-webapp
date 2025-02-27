// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {FormattedMessage} from 'react-intl';

import {oauthToEmail} from 'actions/admin_actions.jsx';
import Constants from 'utils/constants';
import * as Utils from 'utils/utils.jsx';
import {t} from 'utils/i18n.jsx';
import LocalizedInput from 'components/localized_input/localized_input';

type Props = {
    currentType?: any,
    email?: any,
    siteName?: string,
    passwordConfig?: object,
};

export default class OAuthToEmail extends React.PureComponent<Props> {
    private passwordInput: React.RefObject<HTMLInputElement>;
    private passwordConfirmInput: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);

        this.state = {};

        this.passwordInput = React.createRef();
        this.passwordConfirmInput = React.createRef();
    }

    getDefaultState() {
        return {
            error: null,
        };
    }

    submit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        const state = this.getDefaultState();

        const password = this.passwordInput.current && this.passwordInput.current.value;
        if (!password) {
            state.error = Utils.localizeMessage('claim.oauth_to_email.enterPwd', 'Please enter a password.');
            this.setState(state);
            return;
        }

        const {valid, error} = Utils.isValidPassword(password, this.props.passwordConfig);
        if (!valid && error) {
            this.setState({error});
            return;
        }

        const confirmPassword = this.passwordConfirmInput.current && this.passwordConfirmInput.current.value;
        if (!confirmPassword || password !== confirmPassword) {
            state.error = Utils.localizeMessage('claim.oauth_to_email.pwdNotMatch', 'Passwords do not match.');
            this.setState(state);
            return;
        }

        state.error = null;
        this.setState(state);

        oauthToEmail(
            this.props.currentType,
            this.props.email,
            password,
            (data: { follow_link: string; }) => {
                if (data.follow_link) {
                    window.location.href = data.follow_link;
                }
            },
            (err: { message: any; }) => {
                this.setState({error: err.message});
            },
        );
    }
    render() {
        var error = null;
        const state = this.getDefaultState()
        if (state.error) {
            error = <div className='form-group has-error'><label className='control-label'>{state.error}</label></div>;
        }

        var formClass = 'form-group';
        if (error) {
            formClass += ' has-error';
        }

        const uiType = `${(this.props.currentType === Constants.SAML_SERVICE ? Constants.SAML_SERVICE.toUpperCase() : Utils.toTitleCase(this.props.currentType))} SSO`;

        return (
            <div>
                <h3>
                    <FormattedMessage
                        id='claim.oauth_to_email.title'
                        defaultMessage='Switch {type} Account to Email'
                        values={{
                            type: uiType,
                        }}
                    />
                </h3>
                <form onSubmit={this.submit}>
                    <p>
                        <FormattedMessage
                            id='claim.oauth_to_email.description'
                            defaultMessage='Upon changing your account type, you will only be able to login with your email and password.'
                        />
                    </p>
                    <p>
                        <FormattedMessage
                            id='claim.oauth_to_email.enterNewPwd'
                            defaultMessage='Enter a new password for your {site} email account'
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
                            placeholder={{id: t('claim.oauth_to_email.newPwd'), defaultMessage: 'New Password'}}
                            spellCheck='false'
                        />
                    </div>
                    <div className={formClass}>
                        <LocalizedInput
                            type='password'
                            className='form-control'
                            name='passwordconfirm'
                            ref={this.passwordConfirmInput}
                            placeholder={{id: t('claim.oauth_to_email.confirm'), defaultMessage: 'Confirm Password'}}
                            spellCheck='false'
                        />
                    </div>
                    {error}
                    <button
                        type='submit'
                        className='btn btn-primary'
                    >
                        <FormattedMessage
                            id='claim.oauth_to_email.switchTo'
                            defaultMessage='Switch {type} to Email and Password'
                            values={{
                                type: uiType,
                            }}
                        />
                    </button>
                </form>
            </div>
        );
    }
}
