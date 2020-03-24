import { UploadOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { Button, Input, Select, Upload, message } from 'antd'
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale'
import React, { Component, Fragment } from 'react'

import { FormComponentProps } from '@ant-design/compatible/es/form'
import { connect } from 'dva'
import { CurrentUser } from '../data.d'
import GeographicView from './GeographicView'
import PhoneView from './PhoneView'
import styles from './BaseView.less'

const FormItem = Form.Item
const { Option } = Select

// The avatar component is convenient for future independence, adding functions such as cropping
const AvatarView = ({ avatar }: { avatar: string }): JSX.Element => (
	<Fragment>
		<div className={styles.avatar_title}>
			<FormattedMessage id="accountandsettings.basic.avatar" defaultMessage="Avatar" />
		</div>
		<div className={styles.avatar}>
			<img src={avatar} alt="avatar" />
		</div>
		<Upload showUploadList={false}>
			<div className={styles.button_view}>
				<Button>
					<UploadOutlined />
					<FormattedMessage id="accountandsettings.basic.change-avatar" defaultMessage="Change avatar" />
				</Button>
			</div>
		</Upload>
	</Fragment>
)
declare interface SelectItem {
	label: string
	key: string
}

const validatorGeographic: any = (
	_: any,
	value: {
		province: SelectItem
		city: SelectItem
	},
	callback: (message?: string) => void,
) => {
	const { province, city } = value
	if (!province.key) {
		callback('Please input your province!')
	}
	if (!city.key) {
		callback('Please input your city!')
	}
	callback()
}

const validatorPhone = (rule: any, value: string, callback: (message?: string) => void): void => {
	const values = value.split('-')
	if (!values[0]) {
		callback('Please input your area code!')
	}
	if (!values[1]) {
		callback('Please input your phone number!')
	}
	callback()
}

declare interface BaseViewProps extends FormComponentProps {
	currentUser?: CurrentUser
}

class BaseView extends Component<BaseViewProps> {
	view: HTMLDivElement | undefined = undefined

	componentDidMount(): void {
		this.setBaseInfo()
	}

	setBaseInfo = (): void => {
		const { currentUser, form } = this.props
		if (currentUser) {
			Object.keys(form.getFieldsValue()).forEach(key => {
				const obj = {}
				obj[key] = currentUser[key] || null
				form.setFieldsValue(obj)
			})
		}
	}

	getAvatarURL(): string {
		const { currentUser } = this.props
		if (currentUser) {
			if (currentUser.avatar) {
				return currentUser.avatar
			}
			const url = 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png'
			return url
		}
		return ''
	}

	getViewDom = (ref: HTMLDivElement): void => {
		this.view = ref
	}

	handlerSubmit = (event: React.MouseEvent): void => {
		event.preventDefault()
		const { form } = this.props
		form.validateFields(err => {
			if (!err) {
				message.success(
					formatMessage({
						id: 'accountandsettings.basic.update.success',
					}),
				)
			}
		})
	}

	render(): JSX.Element {
		const {
			form: { getFieldDecorator },
		} = this.props
		return (
			<div className={styles.baseView} ref={this.getViewDom}>
				<div className={styles.left}>
					<Form layout="vertical" hideRequiredMark>
						<FormItem
							label={formatMessage({
								id: 'accountandsettings.basic.email',
							})}
						>
							{getFieldDecorator('email', {
								rules: [
									{
										required: true,
										message: formatMessage(
											{
												id: 'accountandsettings.basic.email-message',
											},
											{},
										),
									},
								],
							})(<Input />)}
						</FormItem>
						<FormItem
							label={formatMessage({
								id: 'accountandsettings.basic.nickname',
							})}
						>
							{getFieldDecorator('name', {
								rules: [
									{
										required: true,
										message: formatMessage(
											{
												id: 'accountandsettings.basic.nickname-message',
											},
											{},
										),
									},
								],
							})(<Input />)}
						</FormItem>
						<FormItem
							label={formatMessage({
								id: 'accountandsettings.basic.profile',
							})}
						>
							{getFieldDecorator('profile', {
								rules: [
									{
										required: true,
										message: formatMessage(
											{
												id: 'accountandsettings.basic.profile-message',
											},
											{},
										),
									},
								],
							})(
								<Input.TextArea
									placeholder={formatMessage({
										id: 'accountandsettings.basic.profile-placeholder',
									})}
									rows={4}
								/>,
							)}
						</FormItem>
						<FormItem
							label={formatMessage({
								id: 'accountandsettings.basic.country',
							})}
						>
							{getFieldDecorator('country', {
								rules: [
									{
										required: true,
										message: formatMessage(
											{
												id: 'accountandsettings.basic.country-message',
											},
											{},
										),
									},
								],
							})(
								<Select
									style={{
										maxWidth: 220,
									}}
								>
									<Option value="China">China</Option>
								</Select>,
							)}
						</FormItem>
						<FormItem
							label={formatMessage({
								id: 'accountandsettings.basic.geographic',
							})}
						>
							{getFieldDecorator('geographic', {
								rules: [
									{
										required: true,
										message: formatMessage(
											{
												id: 'accountandsettings.basic.geographic-message',
											},
											{},
										),
									},
									{
										validator: validatorGeographic,
									},
								],
							})(<GeographicView />)}
						</FormItem>
						<FormItem
							label={formatMessage({
								id: 'accountandsettings.basic.address',
							})}
						>
							{getFieldDecorator('address', {
								rules: [
									{
										required: true,
										message: formatMessage(
											{
												id: 'accountandsettings.basic.address-message',
											},
											{},
										),
									},
								],
							})(<Input />)}
						</FormItem>
						<FormItem
							label={formatMessage({
								id: 'accountandsettings.basic.phone',
							})}
						>
							{getFieldDecorator('phone', {
								rules: [
									{
										required: true,
										message: formatMessage(
											{
												id: 'accountandsettings.basic.phone-message',
											},
											{},
										),
									},
									{
										validator: validatorPhone,
									},
								],
							})(<PhoneView />)}
						</FormItem>
						<Button type="primary" onClick={this.handlerSubmit}>
							<FormattedMessage id="accountandsettings.basic.update" defaultMessage="Update Information" />
						</Button>
					</Form>
				</div>
				<div className={styles.right}>
					<AvatarView avatar={this.getAvatarURL()} />
				</div>
			</div>
		)
	}
}

export default connect(({ accountAndSettings }: { accountAndSettings: { currentUser: CurrentUser } }) => ({
	currentUser: accountAndSettings.currentUser,
}))(Form.create<BaseViewProps>()(BaseView))
