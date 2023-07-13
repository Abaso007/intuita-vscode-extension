import cn from 'classnames';
import s from './style.module.css';
import { memo } from 'react';

const Directory = (
	props: Readonly<{
		expanded: boolean;
		label: string;
	}>,
) => {
	return (
		<>
			<span
				className={cn('codicon', {
					'codicon-chevron-right': !props.expanded,
					'codicon-chevron-down': props.expanded,
				})}
			/>
			<div className="flex w-full flex-col">
				<span className={s.labelContainer}>
					<span className={s.label}>{props.label}</span>
				</span>
			</div>
		</>
	);
};

export default memo(Directory);
