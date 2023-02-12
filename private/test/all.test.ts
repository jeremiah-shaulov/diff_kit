import {diff, DiffHandler, DiffHtml, DiffTerm, DiffText} from '../../mod.ts';
import {BOLD_RED_ON_DEFAULT, RED_ON_DEFAULT, WHITE_ON_RED, BOLD_GREEN_ON_DEFAULT, GREEN_ON_DEFAULT, WHITE_ON_GREEN, RESET} from '../diff_handler.ts';
import {assertEquals} from "https://deno.land/std@0.106.0/testing/asserts.ts";

function unindent(text: string)
{	return text.trim().replace(/[\r\n]\t+/g, m => m[0]);
}

const STYLE =
{	minusBegin: '<->',
	minusEnd: '</->',
	plusBegin: '<+>',
	plusEnd: '</+>',
	deletedBegin: '<del>',
	deletedEnd: '</del>',
	insertedBegin: '<ins>',
	insertedEnd: '</ins>',
	deletedLightBegin: '<d>',
	deletedLightEnd: '</d>',
	insertedLightBegin: '<i>',
	insertedLightEnd: '</i>',
};

class DiffTextTest extends DiffText
{	#posLeft = 0;
	#posRight = 0;

	addEqual(endPosLeft: number)
	{	assertEquals(this.#posLeft, this.posLeft);
		assertEquals(this.#posRight, this.posRight);
		super.addEqual(endPosLeft);
		this.#posLeft += endPosLeft - this.posLeft;
		this.#posRight += endPosLeft - this.posLeft;
	}

	addDiff(endPosLeft: number, endPosRight: number)
	{	assertEquals(this.#posLeft, this.posLeft);
		assertEquals(this.#posRight, this.posRight);
		super.addDiff(endPosLeft, endPosRight);
		this.#posLeft += endPosLeft - this.posLeft;
		this.#posRight += endPosRight - this.posRight;
	}
}

class DiffTermTest extends DiffTerm
{	#posLeft = 0;
	#posRight = 0;

	addEqual(endPosLeft: number)
	{	assertEquals(this.#posLeft, this.posLeft);
		assertEquals(this.#posRight, this.posRight);
		super.addEqual(endPosLeft);
		this.#posLeft += endPosLeft - this.posLeft;
		this.#posRight += endPosLeft - this.posLeft;
	}

	addDiff(endPosLeft: number, endPosRight: number)
	{	assertEquals(this.#posLeft, this.posLeft);
		assertEquals(this.#posRight, this.posRight);
		super.addDiff(endPosLeft, endPosRight);
		this.#posLeft += endPosLeft - this.posLeft;
		this.#posRight += endPosRight - this.posRight;
	}
}

class DiffHtmlTest extends DiffHtml
{	#posLeft = 0;
	#posRight = 0;

	addEqual(endPosLeft: number)
	{	assertEquals(this.#posLeft, this.posLeft);
		assertEquals(this.#posRight, this.posRight);
		super.addEqual(endPosLeft);
		this.#posLeft += endPosLeft - this.posLeft;
		this.#posRight += endPosLeft - this.posLeft;
	}

	addDiff(endPosLeft: number, endPosRight: number)
	{	assertEquals(this.#posLeft, this.posLeft);
		assertEquals(this.#posRight, this.posRight);
		super.addDiff(endPosLeft, endPosRight);
		this.#posLeft += endPosLeft - this.posLeft;
		this.#posRight += endPosRight - this.posRight;
	}
}

Deno.test
(	'All',
	() =>
	{	assertEquals(diff('', '', new DiffTextTest), '');
		assertEquals(diff('', '', new DiffTermTest), '');
		assertEquals(diff('', '', new DiffHtmlTest), '');
		assertEquals(diff('a', '', new DiffTextTest({indentWidth: 2}, STYLE)), '<->-</-> <del>a</del>');
		assertEquals(diff('', 'b', new DiffTextTest({indentWidth: 2}, STYLE)), '<+>+</+> <ins>b</ins>');
		assertEquals(diff('a\r\nb', 'a\r\nb', new DiffTextTest({indentWidth: 2}, STYLE)), '  a\r\n  b');
		assertEquals(diff('1\r\na\r\nb', '2\r\na\r\nb', new DiffTextTest({indentWidth: 2}, STYLE)), '<->-</-> <del>1</del>\r\n<+>+</+> <ins>2</ins>\r\n  a\r\n  b');
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffTermTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					<->-</-> <d>def</d>
					<+>+</+> <i>d</i><ins>2</ins><i>ef</i>
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffTermTest({indentWidth: 2}));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					${BOLD_RED_ON_DEFAULT}- ${RED_ON_DEFAULT}def${RESET}
					${BOLD_GREEN_ON_DEFAULT}+ ${GREEN_ON_DEFAULT}d${RESET}${WHITE_ON_GREEN}2${RESET}${GREEN_ON_DEFAULT}ef${RESET}
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					- def
					+ d2ef
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest);
			assertEquals
			(	d, `\tabc\n-\tdef\n+\td2ef`
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffHtmlTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'<div style="white-space:pre">  '+
				unindent
				(	` abc
					<->-</-> <d>def</d>
					<+>+</+> <i>d</i><ins>2</ins><i>ef</i>
					`
				)+'</div>'
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffHtmlTest({indentWidth: 2}));
			assertEquals
			(	d,
				'<div style="white-space:pre">  '+
				unindent
				(	` abc
					<b style="color:red">-</b> <span style="color:red">def</span>
					<b style="color:green">+</b> <span style="color:green">d</span><span style="background-color:green; color:white">2</span><span style="color:green">ef</span>
					`
				)+'</div>'
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffHandler);
			assertEquals
			(	d,
				unindent
				(	`abc
					d[-]2[=]ef
					`
				)
			);
		}
		{	const left =
			`	abc
				de2f
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					<->-</-> <d>de</d><del>2</del><d>f</d>
					<+>+</+> <i>def</i>
					`
				)
			);
		}
		{	const left =
			`	abc
				de2f
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffHandler);
			assertEquals
			(	d,
				unindent
				(	`abc
					de[+]2[=]f
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				defghi
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					<->-</-> <d>def</d>
					<+>+</+> <i>def</i><ins>ghi</ins>
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				def
				ghi
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					  def
					<+>+</+> <ins>ghi</ins>
					`
				)
			);
		}
		{	const left =
			`	abc
				def
				ghi
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					  def
					<->-</-> <del>ghi</del>
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc2
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abc</d>
					<+>+</+> <i>abc</i><ins>2</ins>
					  def
					`
				)
			);
		}
		{	const left =
			`	abc2
				def
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abc</d><del>2</del>
					<+>+</+> <i>abc</i>
					  def
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	1abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abc</d>
					<+>+</+> <ins>1</ins><i>abc</i>
					  def
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	1
				abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<+>+</+> <ins>1</ins>
					  abc
					  def
					`
				)
			);
		}
		{	const left =
			`	1abc
				def
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <del>1</del><d>abc</d>
					<+>+</+> <i>abc</i>
					  def
					`
				)
			);
		}
		{	const left =
			`	1
				abc
				def
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <del>1</del>
					  abc
					  def
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d*e*f
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					<->-</-> <d>def</d>
					<+>+</+> <i>d</i><ins>*</ins><i>e</i><ins>*</ins><i>f</i>
					`
				)
			);
		}
		{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				xyz
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					<->-</-> <del>def</del>
					<+>+</+> <ins>xyz</ins>
					`
				)
			);
		}
		{	const left =
			`	abc
				def
				1
			`;
			const right =
			`	abc
				xyz
				1
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					<->-</-> <del>def</del>
					<+>+</+> <ins>xyz</ins>
					  1
					`
				)
			);
		}
		{	const left =
			`	abc
			`;
			const right =
			`	xyz
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <del>abc</del>
					<+>+</+> <ins>xyz</ins>
					`
				)
			);
		}
		{	const left =
			`	abbc
			`;
			const right =
			`	abbbc
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abbc</d>
					<+>+</+> <i>abb</i><ins>b</ins><i>c</i>
					`
				)
			);
		}
		{	const left =
			`	abab1
			`;
			const right =
			`	1ababab1
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abab1</d>
					<+>+</+> <ins>1ab</ins><i>abab1</i>
					`
				)
			);
		}
		{	const left =
			`	1bab
			`;
			const right =
			`	2abab
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <del>1</del><d>bab</d>
					<+>+</+> <ins>2a</ins><i>bab</i>
					`
				)
			);
		}
		{	const left =
			`	abcdef
			`;
			const right =
			`	abc
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abc</d><del>def</del>
					<+>+</+> <i>abc</i>
					`
				)
			);
		}
		{	const left =
			`	abac1
			`;
			const right =
			`	1abacab1
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abac1</d>
					<+>+</+> <ins>1</ins><i>abac</i><ins>ab</ins><i>1</i>
					`
				)
			);
		}
		{	const left =
			`	.Aaa,
				.Bbb,
				.Ccc,
				.Ddd,
				.Eee,
				.Fff,
				.Ggg,
			`;
			const right =
			`	.Aaa,
				.Ccc,
				.Fff,
				.Ggg,
				.Hhh,
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+unindent
				(	`.Aaa,
					<->-</-> <del>.Bbb,</del>
					  .Ccc,
					<->-</-> <del>.Ddd,</del>
					<->-</-> <del>.Eee,</del>
					  .Fff,
					  .Ggg,
					<+>+</+> <ins>.Hhh,</ins>
					`
				)
			);
		}
		{	const left =
			`	.Aaa,
				.Ccc,
				.Fff,
				.Ggg,
				.Hhh,
			`;
			const right =
			`	.Aaa,
				.Bbb,
				.Ccc,
				.Ddd,
				.Eee,
				.Fff,
				.Ggg,
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+unindent
				(	`.Aaa,
					<+>+</+> <ins>.Bbb,</ins>
					  .Ccc,
					<+>+</+> <ins>.Ddd,</ins>
					<+>+</+> <ins>.Eee,</ins>
					  .Fff,
					  .Ggg,
					<->-</-> <del>.Hhh,</del>
					`
				)
			);
		}
		{	const left =
			`	[A]
				[Bb[0]Ccc Dddd]
				[Bb[0]Eeeee[0]Fff Dddd]
				[Bb[0]Eeeee[11]Fff Dddd]
				[Bb[11]Ccc Dddd]
				[Bb[11]Eeeee[0]Fff Dddd]
				[Bb[11]Eeeee[11]Fff Dddd]
				[A Dddd]
				[Zzz]
			`;
			const right =
			`	[A]
				[Bb[0]Eeeee[0]Fff Dddd]
				[Bb[0]Eeeee[11]Fff Dddd]
				[Bb[0]Ccc Dddd]
				[Bb[11]Eeeee[0]Fff Dddd]
				[Bb[222]Eeeee[11]Fff Dddd]
				[Bb[11]Ccc Dddd]
				[A Dddd]
				[Zzz]
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+unindent
				(	`[A]
					<->-</-> <del>[Bb[0]Ccc Dddd]</del>
					  [Bb[0]Eeeee[0]Fff Dddd]
					  [Bb[0]Eeeee[11]Fff Dddd]
					<+>+</+> <ins>[Bb[0]Ccc Dddd]</ins>
					<+>+</+> <ins>[Bb[11]Eeeee[0]Fff Dddd]</ins>
					<+>+</+> <ins>[Bb[222]Eeeee[11]Fff Dddd]</ins>
					  [Bb[11]Ccc Dddd]
					<->-</-> <del>[Bb[11]Eeeee[0]Fff Dddd]</del>
					<->-</-> <del>[Bb[11]Eeeee[11]Fff Dddd]</del>
					  [A Dddd]
					  [Zzz]
					`
				)
			);
		}
		{	const left =
			`	[A]
				[Bb[0]Eeeee[0]Fff Dddd]
				[Bb[0]Eeeee[11]Fff Dddd]
				[Bb[0]Ccc Dddd]
				[Bb[11]Eeeee[0]Fff Dddd]
				[Bb[222]Eeeee[11]Fff Dddd]
				[Bb[11]Ccc Dddd]
				[A Dddd]
				[Zzz]
			`;
			const right =
			`	[A]
				[Bb[0]Ccc Dddd]
				[Bb[0]Eeeee[0]Fff Dddd]
				[Bb[0]Eeeee[11]Fff Dddd]
				[Bb[11]Ccc Dddd]
				[Bb[11]Eeeee[0]Fff Dddd]
				[Bb[11]Eeeee[11]Fff Dddd]
				[A Dddd]
				[Zzz]
			`;
			const d = diff(unindent(left), unindent(right), new DiffTextTest({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+unindent
				(	`[A]
					<+>+</+> <ins>[Bb[0]Ccc Dddd]</ins>
					  [Bb[0]Eeeee[0]Fff Dddd]
					  [Bb[0]Eeeee[11]Fff Dddd]
					<->-</-> <del>[Bb[0]Ccc Dddd]</del>
					<->-</-> <del>[Bb[11]Eeeee[0]Fff Dddd]</del>
					<->-</-> <del>[Bb[222]Eeeee[11]Fff Dddd]</del>
					  [Bb[11]Ccc Dddd]
					<+>+</+> <ins>[Bb[11]Eeeee[0]Fff Dddd]</ins>
					<+>+</+> <ins>[Bb[11]Eeeee[11]Fff Dddd]</ins>
					  [A Dddd]
					  [Zzz]
					`
				)
			);
		}
	}
);
