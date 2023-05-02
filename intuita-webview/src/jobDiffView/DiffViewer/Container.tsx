import React, { forwardRef } from 'react';
import { VSCodeButton, VSCodeCheckbox } from '@vscode/webview-ui-toolkit/react';
import './Container.css';
import { JobAction, JobDiffViewProps } from '../../shared/types';
import { JobKind } from '../../shared/constants';
import { Diff } from './Diff';
import cn from 'classnames';
import Popover from '../../shared/Popover';

type ContainerProps = Readonly<{
	oldFileName: string | null;
	newFileName: string | null;
	viewType: 'inline' | 'side-by-side';
	children?: React.ReactNode;
}>;

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
	({ oldFileName, newFileName, children, viewType }: ContainerProps, ref) => {
		return (
			<div
				className="flex  flex-wrap w-full container flex-col"
				ref={ref}
			>
				{viewType === 'side-by-side' && newFileName && oldFileName && (
					<div className="flex flex-row w-full">
						<div className="w-half ml-50">
							<p>{oldFileName}</p>
						</div>
						<div className="w-half ml-30">
							<p>{newFileName}</p>
						</div>
					</div>
				)}

				<div className="flex flex-wrap flex-col w-full">{children}</div>
			</div>
		);
	},
);

type HeaderProps = Readonly<{
	id: string;
	diff: Diff | null;
	title: string;
	newFileTitle: string;
	oldFileTitle: string;
	jobKind: JobDiffViewProps['jobKind'];
	viewType: 'inline' | 'side-by-side';
	viewed?: boolean;
	children?: React.ReactNode;
	actions: JobDiffViewProps['actions'];
	jobStaged: boolean;
	changesAccepted: boolean;
	onAction: (arg: JobAction) => void;
	onViewedChange: () => void;
	onViewTypeChange: (viewType: 'inline' | 'side-by-side') => void;
	onReportIssue(): void;
	onToggleJob(): void;
}>;

export const Header = ({
	id,
	diff,
	title,
	jobKind,
	children,
	viewed,
	actions,
	jobStaged,
	changesAccepted,
	onToggleJob,
	onViewedChange,
	onAction,
	onReportIssue,
}: HeaderProps) => {
	const shouldShowDiff = diff && showDiff(jobKind as unknown as JobKind);
	return (
		<div id={id} className="flex w-full items-center container-header">
			<div className="flex flex-row flex-1 justify-between flex-wrap">
				<Popover
					trigger={
						<VSCodeCheckbox
							checked={jobStaged}
							disabled={changesAccepted}
							onChange={onToggleJob}
						/>
					}
					popoverText="Select / Unselect to include or exclude the change."
				/>
				<div className="flex items-center flex-1">
					<h4 className="my-0 ml-3 diff-title align-self-center">
						{title}
					</h4>
				</div>

				<div
					className="flex gap-4"
					onClick={(e) => {
						e.stopPropagation();
					}}
				>
					<Popover
						trigger={
							<VSCodeButton
								appearance="secondary"
								onClick={onReportIssue}
							>
								Report Issue
							</VSCodeButton>
						}
						popoverText="Open a Github issue with a provided template to report a problem."
					/>
					{shouldShowDiff && (
						<div className="ml-10 flex items-center justify-end diff-changes-container">
							<span className="diff-changes diff-removed">
								-{diff.removed}
							</span>

							<span> / </span>

							<span className="diff-changes diff-added">
								+{diff.added}
							</span>
						</div>
					)}
					{actions &&
						actions?.map((el) => (
							<VSCodeButton
								onClick={() => onAction(el)}
								appearance="secondary"
								key={el.command}
							>
								{el.title}
							</VSCodeButton>
						))}
					<div
						className={cn(
							'viewed-button flex ml-10 justify-between checkbox-container items-center',
							{
								disabled: changesAccepted,
							},
						)}
						onClick={(e) => {
							e.stopPropagation();
							onViewedChange();
						}}
					>
						<VSCodeCheckbox
							checked={viewed}
							disabled={changesAccepted}
						/>
						<p className="my-0 ml-10">Viewed</p>
					</div>
				</div>
			</div>
			{children}
		</div>
	);
};

const showDiff = (jobKind: JobKind): boolean => {
	switch (jobKind) {
		case JobKind.copyFile:
		case JobKind.moveFile:
		case JobKind.deleteFile:
			return false;
		default:
			return true;
	}
};
