import {diff, DiffText} from '../../mod.ts';
import {assert, assertEquals} from "https://deno.land/std@0.106.0/testing/asserts.ts";

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

Deno.test
(	'All',
	() =>
	{	{	const left =
			`	abc
				def
			`;
			const right =
			`	abc
				d2ef
			`;
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
				de2f
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
				def
			`;
			const right =
			`	abc
				defghi
			`;
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					<->-</-> <d>def</d>
					<+>+</+> <i>def</i>
					<+>+</+> <ins>ghi</ins>
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}, STYLE));
			assertEquals
			(	d,
				unindent
				(	`<->-</-> <d>abbc</d>
					<+>+</+> <i>abb</i><ins>b</ins><i>c</i>
					`
				)
			);
		}
	}
);
