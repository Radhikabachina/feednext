import { AutoComplete, Input, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import React, { useRef, useState, useEffect } from 'react'

import classNames from 'classnames'
import styles from './index.less'
import { searchTitle } from '@/services/api'
import { router } from 'umi'

const HeaderSearch: React.FC = (): JSX.Element => {
	const inputEl = useRef(null)

	const [value, setValue] = useState('')
	const [searchMode, setSearchMode] = useState(false)
	const [autoCompleteView, setAutoCompleteView] = useState(null)

	const enterSearchMode = (): void => {
		if (autoCompleteView) return
		setSearchMode(true)
		inputEl.current.focus()
	}

	const leaveSearchMode = (): void => {
		setValue('')
		setSearchMode(false)
	}

	const handleTitleRouting = (route: string): void => {
		setAutoCompleteView(null)
		setSearchMode(false)
		setValue('')
		router.push(route)
	}

	useEffect(() => {
		if (value === '') setAutoCompleteView(null)

		if (value.length >= 3) {
			searchTitle(value).then(res => {
				const foundTitles = res.data.attributes.titles.map(title => {
					return {
						label:
							<div
								style={{ width: '100%' }}
								onClick={(): void => handleTitleRouting(`/feeds/${title.slug}`)}
							>
								<Typography.Text style={{ fontSize: 15 }}> {title.name} </Typography.Text>
							</div>,
						options: []
					}
				})
				if (foundTitles.length === 0) setAutoCompleteView(null)
				else setAutoCompleteView(foundTitles)
			})
		}
	}, [value])

	const inputClass = classNames(styles.input, {
		[styles.show]: searchMode,
		[styles.headerSearch]: true,
		[styles.search]: true,
		[styles.action]: true,
	})

	return (
		<span className={inputClass} onClick={enterSearchMode}>
			<AutoComplete
				className={inputClass}
				value={value}
				onChange={(value: string): void => setValue(value)}
				onBlur={leaveSearchMode}
				options={autoCompleteView}
			>
				<Input
					ref={inputEl} placeholder="Search Feeds.."
					onBlur={leaveSearchMode}
				/>
			</AutoComplete>
			<SearchOutlined
				key="Icon"
			/>
		</span>
	)
}

export default HeaderSearch
