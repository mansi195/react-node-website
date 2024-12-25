import React, { useState, useEffect } from 'react';
import { render } from 'react-dom';
import { Router } from '@reach/router';
import axios from 'axios';

import { api } from './helpers/config';
import './index.css';
import Setup from './components/Setup';
import Client from './components/Client';
import DisplayAllProjects from './components/DisplayAllProjects';

export const UserInfo = React.createContext<any>(null); // Define default context value as 'any' for now

// Define types for the user data state
interface UserDataType {
	username: string;
	fullname: string;
	email: string;
	admin_status: string;
}

const basePath: string = process.env.NODE_ENV === 'development' ? process.env.PUBLIC_URL || '' : window['runConfig']?.basePath || '';

const App: React.FC = () => {
	const [UserData, setUserData] = useState<UserDataType | false>(false); // User data state with proper type
	const [Env, setEnv] = useState<string>('');

	useEffect(() => {
		getUserInfo();
	}, []);

	const getUserInfo = (): void => {
		// axios call to get USER INFORMATION
	};

	return (
		<UserInfo.Provider value={UserData}>
			<div className="container">
				<Router basepath={basePath}>
					<DisplayAllProjects path="/" ></DisplayAllProjects>
					<Setup path="/Setup" />
					<Client path="Client"></Client>
				</Router>
			</div>
		</UserInfo.Provider>
	);
};

render(<App />, document.getElementById('root'));
