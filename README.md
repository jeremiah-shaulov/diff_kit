# diff_kit
Deno lib that compares 2 strings and generates result like assertEquals(), also in HTML.

## Example

```ts
// To download and run this example:
// curl 'https://raw.githubusercontent.com/jeremiah-shaulov/diff_kit/v2.0.0/README.md' | perl -ne '$y=$1 if /^```(ts\\b)?/;  print $_ if $y&&$m;  $m=$y&&($m||m~^// deno .*?/example1.ts~)' > /tmp/example1.ts
// deno run /tmp/example1.ts

import {diff, DiffText, DiffTerm, DiffHtml} from 'https://deno.land/x/diff_kit@v2.0.0/mod.ts';

const left =
`abc
def
`;
const right =
`abc
de*f
`;

console.log('--- Default (terminal colors) ---');
let result = diff(left, right);
console.log(result);

console.log('--- Plain text ---');
result = diff(left, right, new DiffText({indentWidth: 2}));
console.log(result);

console.log('--- Terminal colors ---');
result = diff(left, right, new DiffTerm({indentWidth: 2}));
console.log(result);

console.log('--- HTML ---');
result = diff(left, right, new DiffHtml({indentWidth: 2}));
console.log(result);
```

![Screenshot](img/screenshot.png)

## diff()

The main function that this module exports is called `diff()`.

```ts
interface DiffSubj
{	readonly length: number;
	charCodeAt(i: number): number;
	slice(from: number, to: number): string;
}

function diff(left: DiffSubj, right: DiffSubj, diffHandler: DiffHandler=new DiffTerm({indentWidth: 4})): string
```

`DiffSubj` interface is string-compatible, and the most usual use case is to pass strings to the `diff()` function.

## How the result is generated

The 3rd parameter of `diff()` is of `DiffHandler` type. `DiffHandler` has exactly this implementation:

```ts
class DiffHandler
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
```

When an instance of `DiffHandler` is used as a parameter to `diff()`, the very basic plain text diff is generated: deleted parts will be marked with `[-]...[=]`, inserted parts with `[+]...[=]`, and changed parts with `[-]...[+]...[=]`.

```ts
// To download and run this example:
// curl 'https://raw.githubusercontent.com/jeremiah-shaulov/diff_kit/v2.0.0/README.md' | perl -ne '$y=$1 if /^```(ts\\b)?/;  print $_ if $y&&$m;  $m=$y&&($m||m~^// deno .*?/example2.ts~)' > /tmp/example2.ts
// deno run /tmp/example2.ts

import {diff, DiffHandler} from 'https://deno.land/x/diff_kit@v2.0.0/mod.ts';

const left =
`abc
def
`;
const right =
`abc
de*f
`;

console.log(diff(left, right, new DiffHandler));
```

Result:

```
abc
de[-]*[=]f
```

`diff()` calls the following methods and properties of `DiffHandler` to produce the result:
- `left` and `right` properties are set to the first and the second `diff()` parameter.
- `addEqual(endPosLeft: number)` is called to add a text part that is the same for both the left-hand and the right-hand sides of the diff. `this.posLeft` contains the starting index of the part, and `endPosLeft` is the end index, so to extract the part do: `this.left.slice(this.posLeft, endPosLeft)`.
- `addDiff(endPosLeft: number, endPosRight: number)` is called to add a part that is different. The left part is `this.left.slice(this.posLeft, endPosLeft)`, and the right is `this.right.slice(this.posRight, endPosRight)`. One of the parts can be empty (but not both).
- Before calling `addEqual()` and `addDiff()`, `posLeft` and `posRight` properties are set to current positions in the `left` and `right`.
- `toString()` - at last, the object is converted to string to produce the result.

The same method is not called twice in sequence. That is, for example, after `addEqual()` either `addDiff()` or `toString()` will be called.

To produce results in different formats, use subclasses of `DiffHandler` that have different implementations of `addEqual()` and `addDiff()`.

This library contains 3 classes that provide visualization of the diff result:
- `DiffText` - generates line-by-line comparison in plain text.
- `DiffTerm` - generates line-by-line comparison with highlighting different parts using terminal colors. This is very similar to standard `assertEquals()` function.
- `DiffHtml` - like the previous, but generates HTML.

All these classes provide option to adjust colors and markup:

```ts
class DiffText extends DiffHandler
{	constructor(options?: DiffTextOptions, styles?: DiffTextStyles);
}
class DiffTerm extends DiffText
{	constructor(options?: DiffTextOptions, styles?: DiffTextStyles);
}
class DiffHtml extends DiffText
{	constructor(options?: DiffTextOptions, styles?: DiffTextStyles);
}

interface DiffTextOptions
{	/**	Number of spaces to be used as indent: from 0 to 10 (inclusive), or -1 for TAB.
	 **/
	indentWidth?: number;
}

interface DiffTextStyles
{	/**	What to insert before "-" char that denotes line deletion. Like `<b style="color:red">`
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
```

## Extending this library

You can create your own subclass of `DiffHandler` to generate the result in different form, and use it in your project, or to publish it to `deno.land/x`. It's recommended to prefix the library name with `diff_kit_ex_`.
