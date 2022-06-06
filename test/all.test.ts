import {diff, DiffText} from '../mod.ts';
import {assert, assertEquals} from "https://deno.land/std@0.106.0/testing/asserts.ts";

function unindent(text: string)
{	return text.trim().replace(/[\r\n]\t+/g, m => m[0]);
}

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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}));
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
				de2f
			`;
			const right =
			`	abc
				def
			`;
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					- de2f
					+ def
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
			const d = diff(unindent(left), unindent(right), new DiffText({indentWidth: 2}));
			assertEquals
			(	d,
				'  '+
				unindent
				(	` abc
					- def
					+ defghi
					`
				)
			);
		}
	}
);
