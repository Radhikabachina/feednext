// Antd dependencies
import { Layout, Typography } from 'antd'

// Other dependencies
import React from 'react'
import { useSelector } from 'react-redux'
import { Link, Redirect } from 'umi'

// Local files
import logo from '../assets/logo-square.svg'
import styles from './AuthLayout.less'

const AuthLayout: React.FC = props => {
	const user = useSelector((state: any) => state.user)

	if (user && (location.pathname === '/auth/sign-in' || location.pathname === '/auth/sign-up')) {
		return <Redirect to="/" />
	}

	return (
		<>
			<div className={styles.container}>
				<div className={styles.content}>
					<div className={styles.top}>
						<div className={styles.header}>
							<Link to="/">
								<img alt="logo" className={styles.logo} src={logo} />
								<span className={styles.title}>Feednext</span>
							</Link>
						</div>
						<div className={styles.desc} />
					</div>
					{props.children}
				</div>
				<Layout.Footer style={{ background: 'transparent', textAlign: 'center' }}>
					<Typography.Text>
						Feednext © 2020. All rights reserved
					</Typography.Text>
				</Layout.Footer>
			</div>
		</>
	)
}

export default AuthLayout
