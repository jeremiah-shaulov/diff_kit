export const BOLD_RED_ON_DEFAULT = '\x1b[1;31m';
export const RED_ON_DEFAULT = '\x1b[0;31m';
export const WHITE_ON_RED = '\x1b[97;41m';
export const BOLD_GREEN_ON_DEFAULT = '\x1b[1;32m';
export const GREEN_ON_DEFAULT = '\x1b[0;32m';
export const WHITE_ON_GREEN = '\x1b[97;42m';
export const RESET = '\x1b[0m';

const CR = 13;
const LF = 10;

export class DiffHandler
{	posLeft = 0;
	posRight = 0;
	lenLeft = 0;
	lenRight = 0;

	protected result = '';

	addEqual(part: string)
	{	this.result += part;
	}

	addDiff(partLeft: string, partRight: string)
	{	if (partRight)
		{	this.result += '[-]';
			this.result += partRight;
		}
		if (partLeft)
		{	this.result += '[+]';
			this.result += partLeft;
		}
		this.result += '[=]';
	}

	toString()
	{	return this.result;
	}
}

export interface DiffTextOptions
{	indentWidth?: number,
}

export interface DiffTextStyles
{	minusBegin?: string;
	minusEnd?: string;
	plusBegin?: string;
	plusEnd?: string;
	deletedLightBegin?: string;
	deletedBegin?: string;
	deletedLightEnd?: string;
	deletedEnd?: string;
	insertedLightBegin?: string;
	insertedBegin?: string;
	insertedLightEnd?: string;
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

	constructor(options?: DiffTextOptions, styles?: DiffTextStyles)
	{	super();
		
		const indentWidth = options?.indentWidth ?? -1;
		this.#addIndent = indentWidth>=0 && indentWidth<=8 ? ' '.repeat(indentWidth) : '\t';

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
		return this.result;
	}

	addEqual(part: string)
	{	if (this.#leftHalfLine || this.#rightHalfLine)
		{	let i;
			for (i=0; i<part.length; i++)
			{	const c = part.charCodeAt(i);
				if (c==CR || c==LF)
				{	const j = i++;
					if (c==CR && part.charCodeAt(i)==LF)
					{	i++;
					}
					const halfLine = part.slice(0, j);
					const nl = part.slice(j, i);
					part = part.slice(i);
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
					if (i == part.length)
					{	this.#leftHalfLine = this.#deletedLightBegin + part;
						this.#rightHalfLine = this.#insertedLightBegin + part;
						this.#eqHalfLine = part;
						this.#leftHalfLineIsLight = true;
						this.#rightHalfLineIsLight = true;
						return;
					}
					break;
				}
			}
			if (i == part.length)
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
				this.#leftHalfLine += part;
				this.#rightHalfLine += part;
				return;
			}
		}
		const {result, halfLine} = this.#addOne(this.result, '', part, this.#addIndent, false, '', '', '');
		this.result = result;
		if (halfLine)
		{	this.#leftHalfLine = this.#deletedLightBegin + halfLine;
			this.#rightHalfLine = this.#insertedLightBegin + halfLine;
			this.#eqHalfLine = halfLine;
			this.#leftHalfLineIsLight = true;
			this.#rightHalfLineIsLight = true;
		}
	}
	
	addDiff(partLeft: string, partRight: string)
	{	this.#eqHalfLine = '';
		// deno-lint-ignore no-var
		var {result, halfLine, isLight} = this.#addOne(this.#left, this.#leftHalfLine, partLeft, this.#addIndentMinus, this.#leftHalfLineIsLight, this.#deletedLightEnd, this.#deletedBegin, this.#deletedEnd);
		this.#left = result;
		this.#leftHalfLine = halfLine;
		this.#leftHalfLineIsLight = isLight;
		// deno-lint-ignore no-var, no-redeclare
		var {result, halfLine, isLight} = this.#addOne(this.#right, this.#rightHalfLine, partRight, this.#addIndentPlus, this.#rightHalfLineIsLight, this.#insertedLightEnd, this.#insertedBegin, this.#insertedEnd);
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
	
	#addOne(result: string, halfLine: string, part: string, indent: string, isLight: boolean, lightEnd: string, begin: string, end: string)
	{	let from = 0;
		for (let i=0; i<part.length; i++)
		{	const c = part.charCodeAt(i);
			if (c==CR || c==LF)
			{	const j = i++;
				if (c==CR && part.charCodeAt(i)==LF)
				{	i++;
				}
				result += indent;
				let add = part.slice(from, j);
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
				result += part.slice(j, i);
				from = i;
			}
		}
		const halfLine2 = part.slice(from);
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
