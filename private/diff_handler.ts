const BOLD_RED_ON_DEFAULT = '\x1b[1;31m';
const RED_ON_DEFAULT = '\x1b[0;31m';
const WHITE_ON_RED = '\x1b[97;41m';
const BOLD_GREEN_ON_DEFAULT = '\x1b[1;32m';
const GREEN_ON_DEFAULT = '\x1b[0;32m';
const WHITE_ON_GREEN = '\x1b[97;42m';
const RESET = '\x1b[0m';

const SPACE = 32;
const CR = 13;
const LF = 10;
const RE_NL = /\r?\n|\r/g;

function findLineStart(part: string)
{	for (let i=part.length-1; i>=0; i--)
	{	if (part.charCodeAt(i)==CR || part.charCodeAt(i)==LF)
		{	return i + 1;
		}
	}
	return 0;
}

function findLineEnd(part: string)
{	for (let i=0; i<part.length; i++)
	{	if (part.charCodeAt(i)==CR || part.charCodeAt(i)==LF)
		{	return i;
		}
	}
	return -1;
}

export class DiffHandler
{	protected result = '';

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

	#partLeft = '';
	#partRight = '';

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

		this.#addIndentMinus = this.#minusBegin + '-' + this.#minusEnd + (this.#addIndent=='\t' ? '\t' : this.#addIndent.slice(0, -1)) + this.#deletedBegin;
		this.#addIndentPlus = this.#plusBegin + '+' + this.#plusEnd + (this.#addIndent=='\t' ? '\t' : this.#addIndent.slice(0, -1)) + this.#insertedBegin;

		this.result = this.#addIndent;
	}

	toString()
	{	if (this.#partLeft || this.#partRight)
		{	this.result += this.#partLeft + this.#deletedEnd + this.#deletedLightBegin + this.#deletedLightEnd + '\n' + this.#partRight + this.#insertedEnd + this.#insertedLightBegin + this.#insertedLightEnd;
			this.#partLeft = '';
			this.#partRight = '';
		}
		return this.result==this.#addIndent ? '' : this.result;
	}

	addEqual(part: string)
	{	if (this.#partLeft || this.#partRight)
		{	const pos = findLineEnd(part);
			if (pos == -1)
			{	this.#partLeft += part;
				this.#partRight += part;
				return;
			}
			const add = part.slice(0, pos);
			this.result += this.#partLeft + add + this.#deletedLightEnd + '\n' + this.#partRight + add + this.#insertedLightEnd;
			part = part.slice(pos);
			this.#partLeft = '';
			this.#partRight = '';
		}
		this.result += part.replace(RE_NL, m => m + this.#addIndent);
	}
	
	addDiff(partLeft: string, partRight: string)
	{	if (!this.#partLeft && !this.#partRight)
		{	const lineStart = findLineStart(this.result);
			let line = this.result.slice(lineStart);
			this.result = this.result.slice(0, lineStart);
			if (line.charCodeAt(0) == SPACE)
			{	line = line.slice(1); // replace space with '-' or '+'
			}
			this.#partLeft = this.#minusBegin + '-' + this.#minusEnd + this.#deletedLightBegin + line;
			this.#partRight = this.#plusBegin + '+' + this.#plusEnd + this.#insertedLightBegin + line;
		}
		if (partLeft)
		{	this.#partLeft += this.#deletedLightEnd + this.#deletedBegin + partLeft.replace(RE_NL, m => this.#deletedEnd + m + this.#addIndentMinus) + this.#deletedEnd + this.#deletedLightBegin;
		}
		if (partRight)
		{	this.#partRight += this.#insertedLightEnd + this.#insertedBegin + partRight.replace(RE_NL, m => this.#insertedEnd + m + this.#addIndentPlus) + this.#insertedEnd + this.#insertedLightBegin;
		}
	}
}

export class DiffTerm extends DiffText
{	constructor(options?: DiffTextOptions)
	{	super
		(	options,
			{	minusBegin: BOLD_RED_ON_DEFAULT,
				plusBegin: BOLD_GREEN_ON_DEFAULT,
				deletedBegin: WHITE_ON_RED,
				insertedBegin: WHITE_ON_GREEN,
				deletedLightBegin: RED_ON_DEFAULT,
				deletedLightEnd: RESET,
				insertedLightBegin: GREEN_ON_DEFAULT,
				insertedLightEnd: RESET,
			}
		);
	}
}

export class DiffHtml extends DiffText
{	constructor(options?: DiffTextOptions)
	{	super
		(	options,
			{	minusBegin: '<b style="color:red">',
				minusEnd: '</b>',
				plusBegin: '<b style="color:green">',
				plusEnd: '</b>',
				deletedBegin: '<span style="background-color:red; color:white">',
				deletedEnd: '</span>',
				insertedBegin: '<span style="background-color:green; color:white">',
				insertedEnd: '</span>',
				deletedLightBegin: '<span style="color:red">',
				deletedLightEnd: '</span>',
				insertedLightBegin: '<span style="color:green">',
				insertedLightEnd: '</span>',
			}
		);
	}

	toString()
	{	const result = super.toString();
		return result ? `<div style="white-space:pre">${result}</div>` : '';
	}
}
