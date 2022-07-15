import * as React from 'react';

import { Modal, Button } from 'react-bootstrap';

//import fetch from 'cross-fetch';

export interface LoginPopupProps {
  onClose: any;
}

export interface LoginPopupState {
  username: string;
  password: string;
  passwordCompare: string;
  email: string;
  firstname: string;
  lastname: string;
  isRegistratingNewUser: boolean;
}


export class Login extends React.Component<LoginPopupProps, LoginPopupState> {
  override state = {
    username: '',
    password: '',
    passwordCompare: '',
    email: '',
    firstname: '',
    lastname: '',
    isRegistratingNewUser: false,
  };

  override componentDidMount() {
    let loadingElement = document.getElementById("loading");
    if (loadingElement && !loadingElement.classList.contains("loaded")) {
      loadingElement.classList.add("loaded");
      setTimeout(() => {
        let loadingElement = document.getElementById("loading");
        if (loadingElement) {
          loadingElement.classList.add("hidden");
        }
      },350);
    }
  }

  onChange = (event: {
    preventDefault: any;
    target: {
      name: keyof LoginPopupState;
      value: any;
    };
  }) => {
    event.preventDefault();
    const newState = { [event.target.name]: event.target.value } as Pick<LoginPopupState, keyof LoginPopupState>;
    this.setState(newState);

    return false;
  };

  switchToRegisterNewUser = event => {
    event.preventDefault();
    this.setState({ isRegistratingNewUser: !this.state.isRegistratingNewUser });
    return false;
  };

  showLoadingScreen = () => {
    let loadingElement = document.getElementById("loading");
    if (loadingElement && !loadingElement.classList.contains("loaded")) {
      loadingElement.classList.add("loaded");
      setTimeout(() => {
        let loadingElement = document.getElementById("loading");
        if (loadingElement) {
          loadingElement.classList.remove("hidden");
        }
      },350);
    }
  }

  onSubmit = event => {
    event.preventDefault();
    if (this.state.isRegistratingNewUser) {
      if (this.state.password !== this.state.passwordCompare) {
        alert('Passwords do not match');
        return false;
      }

      fetch('/api/register-user', {
        method: 'POST',
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
          firstname: this.state.firstname,
          lastname: this.state.lastname,
          email: this.state.email,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          if (res.status >= 400) {
            alert('Register new user failed, please try again');
            throw new Error('Bad response from server');
          }
          return res.json();
        })
        .then(repsonse => {
          if (repsonse.jwt !== undefined && repsonse.jwt !== '') {
            this.showLoadingScreen();
            this.props.onClose();
          } else {
            alert('Register new user failed, please try again');
          }
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          username: this.state.username,
          password: this.state.password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          if (res.status >= 400) {
            alert('Login failed, please try again');
            throw new Error('Bad response from server');
          }
          return res.json();
        })
        .then(repsonse => {
          if (repsonse.jwt !== undefined && repsonse.jwt !== '') {
            this.showLoadingScreen();
            this.props.onClose();
          } else {
            alert('Login failed, please try again');
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
    return false;
  };

  override render() {
    return (
      <Modal show={true} centered size="sm">
        <Modal.Header>
          <Modal.Title>{this.state.isRegistratingNewUser ? 'Register' : 'Login'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <form className="form mx-auto" onSubmit={this.onSubmit}>
            <div className="form-group">
              <label htmlFor="userName">Username</label>
              <input
                type="text"
                required
                value={this.state.username}
                onChange={this.onChange as any}
                className="form-control"
                id="userName"
                name="username"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                required
                className="form-control"
                id="password"
                name="password"
                value={this.state.password}
                onChange={this.onChange as any}
              />
            </div>
            {this.state.isRegistratingNewUser && (
              <>
                <div className="form-group">
                  <label htmlFor="passwordCompare">Password compare</label>
                  <input
                    type="password"
                    required
                    className="form-control"
                    id="passwordCompare"
                    name="passwordCompare"
                    value={this.state.passwordCompare}
                    onChange={this.onChange as any}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="firstname">First name</label>
                  <input
                    type="text"
                    required
                    value={this.state.firstname}
                    onChange={this.onChange as any}
                    className="form-control"
                    id="firstname"
                    name="firstname"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastname">Last name</label>
                  <input
                    type="text"
                    required
                    value={this.state.lastname}
                    onChange={this.onChange as any}
                    className="form-control"
                    id="lastname"
                    name="lastname"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">E-mail</label>
                  <input
                    type="email"
                    required
                    value={this.state.email}
                    onChange={this.onChange as any}
                    className="form-control"
                    id="email"
                    name="email"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Register
                </button>
                <a href="#" className="ml-2" onClick={this.switchToRegisterNewUser}>
                  Login
                </a>
              </>
            )}
            {!this.state.isRegistratingNewUser && (
              <>
                <button type="submit" className="btn btn-primary">
                  Login
                </button>
                <a href="#" className="ml-2" onClick={this.switchToRegisterNewUser}>
                  Register new user
                </a>
              </>
            )}
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}