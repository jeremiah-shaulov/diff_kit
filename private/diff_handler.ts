export const BOLD_RED_ON_DEFAULT = '\x1B[0;1;31m';
export const RED_ON_DEFAULT = '\x1B[0;31m';
export const WHITE_ON_RED = '\x1B[0;97;41m';
export const BOLD_GREEN_ON_DEFAULT = '\x1B[0;1;32m';
export const GREEN_ON_DEFAULT = '\x1B[0;32m';
export const WHITE_ON_GREEN = '\x1B[0;97;42m';
export const RESET = '\x1B[0m';

const CR = 13;
const LF = 10;

export interface DiffSubj
{	readonly length: number;
	charCodeAt(i: number): number;
	slice(from: number, to: number): string;
}

export class DiffHandler
{	left: DiffSubj = '';
	right: DiffSubj = '';

	posLeft = 0;
	posRight = 0;

	protected result = '';

	addEqual(endPosLeft: number)
	{	this.result += this.left.slice(this.posLeft, endPosLeft);
	}

	addDiff(endPosLeft: number, endPosRight: number)
	{	if (endPosRight > this.posRight)
		{	this.result += '[-]';
			this.result += this.right.slice(this.posRight, endPosRight);
		}
		if (endPosLeft > this.posLeft)
		{	this.result += '[+]';
			this.result += this.left.slice(this.posLeft, endPosLeft);
		}
		this.result += '[=]';
	}

	toString()
	{	return this.result;
	}
}

export interface DiffTextOptions
{	// Properties:

	/**	Number of spaces to be used as indent: from 0 to 10 (inclusive), or -1 for TAB.
	 **/
	indentWidth?: number;
}

export interface DiffTextStyles
{	// Properties:

	/**	What to insert before "-" char that denotes line deletion. Like `<b style="color:red">`
	 **/
	minusBegin?: string;

	/**	What to insert after "-" char that denotes line deletion. Like `</b>`
	 **/
	minusEnd?: string;

	/**	What to insert before "+" char that denotes line insertion. Like `<b style="color:green">`
	 **/
	plusBegin?: string;

	/**	What to insert after "+" char that denotes line insertion. Like `</b>`
	 **/
	plusEnd?: string;

	/**	What to insert in the beginning of deleted line. Like `<span style="color:red">`
	 **/
	deletedLightBegin?: string;

	/**	What to insert in the end of deleted line. Like `</span>`
	 **/
	deletedLightEnd?: string;

	/**	What to insert in the beginning of inserted line. Like `<span style="color:green">`
	 **/
	insertedLightBegin?: string;

	/**	What to insert in the end of inserted line. Like `</span>`
	 **/
	insertedLightEnd?: string;

	/**	What to insert where actual deleted chars on the line are starting. Like `<span style="background-color:red; color:white">`
	 **/
	deletedBegin?: string;

	/**	What to insert where actual deleted chars on the line are ending. Like `</span>`
	 **/
	deletedEnd?: string;

	/**	What to insert where actual inserted chars on the line are starting. Like `<span style="background-color:green; color:white">`
	 **/
	insertedBegin?: string;

	/**	What to insert where actual inserted chars on the line are ending. Like `</span>`
	 **/
	insertedEnd?: string;
}

export class DiffText extends DiffHandler
{	#addIndent: string;
	#addIndentMinus: string;
	#addIndentPlus: string;

	#minusBegin: string;
	#minusEnd: string;
	#plusBegin: string;
	#plusEnd: string;
	#deletedLightBegin: string;
	#deletedBegin: string;
	#deletedLightEnd: string;
	#deletedEnd: string;
	#insertedLightBegin: string;
	#insertedBegin: string;
	#insertedLightEnd: string;
	#insertedEnd: string;

	#left = '';
	#right = '';
	#leftHalfLine = '';
	#rightHalfLine = '';
	#eqHalfLine = '';
	#leftHalfLineIsLight = false;
	#rightHalfLineIsLight = false;

	#curFromRight = 0;
	#curFromLeft = 0;

	constructor(options?: DiffTextOptions, styles?: DiffTextStyles)
	{	super();

		const indentWidth = options?.indentWidth ?? -1;
		this.#addIndent = indentWidth>=0 && indentWidth<=10 ? ' '.repeat(indentWidth) : '\t';

		this.#minusBegin = styles?.minusBegin ?? '';
		this.#minusEnd = styles?.minusEnd ?? '';
		this.#plusBegin = styles?.plusBegin ?? '';
		this.#plusEnd = styles?.plusEnd ?? '';
		this.#deletedLightBegin = styles?.deletedLightBegin ?? '';
		this.#deletedBegin = styles?.deletedBegin ?? '';
		this.#deletedLightEnd = styles?.deletedLightEnd ?? '';
		this.#deletedEnd = styles?.deletedEnd ?? '';
		this.#insertedLightBegin = styles?.insertedLightBegin ?? '';
		this.#insertedBegin = styles?.insertedBegin ?? '';
		this.#insertedLightEnd = styles?.insertedLightEnd ?? '';
		this.#insertedEnd = styles?.insertedEnd ?? '';

		this.#addIndentMinus = this.#minusBegin + '-' + this.#minusEnd + (this.#addIndent=='\t' ? '\t' : this.#addIndent.slice(0, -1));
		this.#addIndentPlus = this.#plusBegin + '+' + this.#plusEnd + (this.#addIndent=='\t' ? '\t' : this.#addIndent.slice(0, -1));
	}

	toString()
	{	if (!this.#left && !this.#right && this.#eqHalfLine)
		{	this.result += this.#addIndent + this.#eqHalfLine;
			this.#leftHalfLine = '';
			this.#rightHalfLine = '';
			this.#eqHalfLine = '';
		}
		else if (this.#left || this.#right || this.#leftHalfLine || this.#rightHalfLine)
		{	this.result += this.#left;
			if (this.#leftHalfLine)
			{	this.result += this.#addIndentMinus + this.#leftHalfLine + (this.#leftHalfLineIsLight ? this.#deletedLightEnd : this.#deletedEnd);
				if (this.#right || this.#rightHalfLine)
				{	this.result += '\n';
				}
			}
			this.result += this.#right;
			if (this.#rightHalfLine)
			{	this.result += this.#addIndentPlus + this.#rightHalfLine + (this.#rightHalfLineIsLight ? this.#insertedLightEnd : this.#insertedEnd);
			}
			this.#left = this.#leftHalfLine = '';
			this.#right = this.#rightHalfLine = '';
		}
		this.#curFromLeft = 0;
		this.#curFromRight = 0;
		return this.result;
	}

	addEqual(endPosLeft: number)
	{	let {left, posLeft} = this;
		// maybe add to previous incomplete line
		if (this.#leftHalfLine || this.#rightHalfLine)
		{	let i;
			for (i=posLeft; i<endPosLeft; i++)
			{	const c = left.charCodeAt(i);
				if (c==CR || c==LF)
				{	const j = i++;
					if (c==CR && left.charCodeAt(i)==LF)
					{	i++;
					}
					const halfLine = left.slice(posLeft, j);
					const nl = left.slice(j, i);
					posLeft = i;
					this.result += this.#left + this.#addIndentMinus + this.#leftHalfLine;
					if (this.#leftHalfLineIsLight)
					{	this.result += halfLine + this.#deletedLightEnd;
					}
					else
					{	if (this.#leftHalfLine)
						{	this.result += this.#deletedEnd;
						}
						if (halfLine)
						{	this.result += this.#deletedLightBegin + halfLine + this.#deletedLightEnd;
						}
					}
					this.result += nl;
					this.result += this.#right + this.#addIndentPlus + this.#rightHalfLine;
					if (this.#rightHalfLineIsLight)
					{	this.result += halfLine + this.#insertedLightEnd;
					}
					else
					{	if (this.#rightHalfLine)
						{	this.result += this.#insertedEnd;
						}
						if (halfLine)
						{	this.result += this.#insertedLightBegin + halfLine + this.#insertedLightEnd;
						}
					}
					this.result += nl;
					this.#left = this.#leftHalfLine = '';
					this.#right = this.#rightHalfLine = '';
					if (i == endPosLeft)
					{	const part = left.slice(posLeft, endPosLeft);
						this.#leftHalfLine = this.#deletedLightBegin + part;
						this.#rightHalfLine = this.#insertedLightBegin + part;
						this.#eqHalfLine = part;
						this.#leftHalfLineIsLight = true;
						this.#rightHalfLineIsLight = true;
						return;
					}
					break;
				}
			}
			if (i == endPosLeft)
			{	if (!this.#leftHalfLineIsLight)
				{	if (this.#leftHalfLine)
					{	this.#leftHalfLine += this.#deletedEnd;
					}
					this.#leftHalfLine += this.#deletedLightBegin;
					this.#leftHalfLineIsLight = true;
				}
				if (!this.#rightHalfLineIsLight)
				{	if (this.#rightHalfLine)
					{	this.#rightHalfLine += this.#insertedEnd;
					}
					this.#rightHalfLine += this.#insertedLightBegin;
					this.#rightHalfLineIsLight = true;
				}
				const part = left.slice(posLeft, endPosLeft);
				this.#leftHalfLine += part;
				this.#rightHalfLine += part;
				return;
			}
		}
		let subj = left;
		const len = endPosLeft - posLeft;
		// if left is at end and there's no newline chars at the end, and on the right side there's a newline following this part, then add the newline to the left side as well (otherwise the incomplete line on the left will be marked as deleted, and then inserted with newline)
		if (this.posLeft+len == this.left.length)
		{	const add = this.#takeCareOfNoNewlineAtEnd(this.right, this.posRight+len);
			this.#curFromRight = add.length;
			subj = left.slice(posLeft, endPosLeft) + add;
			posLeft = 0;
			endPosLeft = subj.length;
		}
		// the same for right
		else if (this.posRight+len == this.right.length)
		{	const add = this.#takeCareOfNoNewlineAtEnd(this.left, this.posLeft+len);
			this.#curFromLeft = add.length;
			subj = left.slice(posLeft, endPosLeft) + add;
			posLeft = 0;
			endPosLeft = subj.length;
		}
		// add part
		const {result, halfLine} = this.#addOne(this.result, '', subj, posLeft, endPosLeft, this.#addIndent, false, '', '', '');
		this.result = result;
		if (halfLine)
		{	this.#leftHalfLine = this.#deletedLightBegin + halfLine;
			this.#rightHalfLine = this.#insertedLightBegin + halfLine;
			this.#eqHalfLine = halfLine;
			this.#leftHalfLineIsLight = true;
			this.#rightHalfLineIsLight = true;
		}
	}

	#takeCareOfNoNewlineAtEnd(subj: DiffSubj, nextPos: number)
	{	const c = subj.charCodeAt(nextPos);
		return c==LF ? '\n' : c!=CR ? '' : subj.charCodeAt(nextPos+1)==LF ? '\r\n' : '\r';
	}

	addDiff(endPosLeft: number, endPosRight: number)
	{	this.#eqHalfLine = '';
		// deno-lint-ignore no-var
		var {result, halfLine, isLight} = this.#addOne(this.#left, this.#leftHalfLine, this.left, this.posLeft+this.#curFromLeft, endPosLeft, this.#addIndentMinus, this.#leftHalfLineIsLight, this.#deletedLightEnd, this.#deletedBegin, this.#deletedEnd);
		this.#left = result;
		this.#leftHalfLine = halfLine;
		this.#leftHalfLineIsLight = isLight;
		// deno-lint-ignore no-var, no-redeclare
		var {result, halfLine, isLight} = this.#addOne(this.#right, this.#rightHalfLine, this.right, this.posRight+this.#curFromRight, endPosRight, this.#addIndentPlus, this.#rightHalfLineIsLight, this.#insertedLightEnd, this.#insertedBegin, this.#insertedEnd);
		this.#right = result;
		this.#rightHalfLine = halfLine;
		this.#rightHalfLineIsLight = isLight;
		if (!this.#leftHalfLine && !this.#rightHalfLine)
		{	this.result += this.#left;
			this.result += this.#right;
			this.#left = '';
			this.#right = '';
		}
	}

	#addOne(result: string, halfLine: string, subj: DiffSubj, partPos: number, partEndPos: number, indent: string, isLight: boolean, lightEnd: string, begin: string, end: string)
	{	let from = partPos;
		for (let i=partPos; i<partEndPos; i++)
		{	const c = subj.charCodeAt(i);
			if (c==CR || c==LF)
			{	const j = i++;
				if (c==CR && subj.charCodeAt(i)==LF)
				{	i++;
				}
				result += indent;
				let add = subj.slice(from, j);
				if (halfLine)
				{	result += halfLine;
					halfLine = '';
					if (isLight)
					{	result += lightEnd;
						isLight = false;
					}
					else
					{	result += add + end;
						add = '';
					}
				}
				if (add)
				{	result += begin + add + end;
				}
				result += subj.slice(j, i);
				from = i;
			}
		}
		const halfLine2 = subj.slice(from, partEndPos);
		if (halfLine2)
		{	if (halfLine)
			{	if (isLight)
				{	halfLine += lightEnd + begin;
				}
				halfLine += halfLine2;
			}
			else
			{	halfLine = begin + halfLine2;
			}
			isLight = false;
		}
		return {result, halfLine, isLight};
	}
}

export class DiffTerm extends DiffText
{	constructor(options?: DiffTextOptions, styles?: DiffTextStyles)
	{	super
		(	options,
			{	minusBegin: styles?.minusBegin ?? BOLD_RED_ON_DEFAULT,
				minusEnd: styles?.minusEnd ?? '',
				plusBegin: styles?.plusBegin ?? BOLD_GREEN_ON_DEFAULT,
				plusEnd: styles?.plusEnd ?? '',
				deletedBegin: styles?.deletedBegin ?? WHITE_ON_RED,
				deletedEnd: styles?.deletedEnd ?? RESET,
				insertedBegin: styles?.insertedBegin ?? WHITE_ON_GREEN,
				insertedEnd: styles?.insertedEnd ?? RESET,
				deletedLightBegin: styles?.deletedLightBegin ?? RED_ON_DEFAULT,
				deletedLightEnd: styles?.deletedLightEnd ?? RESET,
				insertedLightBegin: styles?.insertedLightBegin ?? GREEN_ON_DEFAULT,
				insertedLightEnd: styles?.insertedLightEnd ?? RESET,
			}
		);
	}
}

export class DiffHtml extends DiffText
{	constructor(options?: DiffTextOptions, styles?: DiffTextStyles)
	{	super
		(	options,
			{	minusBegin: styles?.minusBegin ?? '<b style="color:red">',
				minusEnd: styles?.minusEnd ?? '</b>',
				plusBegin: styles?.plusBegin ?? '<b style="color:green">',
				plusEnd: styles?.plusEnd ?? '</b>',
				deletedBegin: styles?.deletedBegin ?? '<span style="background-color:red; color:white">',
				deletedEnd: styles?.deletedEnd ?? '</span>',
				insertedBegin: styles?.insertedBegin ?? '<span style="background-color:green; color:white">',
				insertedEnd: styles?.insertedEnd ?? '</span>',
				deletedLightBegin: styles?.deletedLightBegin ?? '<span style="color:red">',
				deletedLightEnd: styles?.deletedLightEnd ?? '</span>',
				insertedLightBegin: styles?.insertedLightBegin ?? '<span style="color:green">',
				insertedLightEnd: styles?.insertedLightEnd ?? '</span>',
			}
		);
	}

	toString()
	{	const result = super.toString();
		return result ? `<div style="white-space:pre">${result}</div>` : '';
	}
}
