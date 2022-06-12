import {DiffHandler, DiffTerm} from './diff_handler.ts';

export interface DiffSubj
{	readonly length: number;
	charCodeAt(i: number): number;
	slice(from: number, to: number): string;
}

export function diff(left: DiffSubj, right: DiffSubj, diffHandler: DiffHandler=new DiffTerm({indentWidth: 4}))
{	const lLen = left.length;
	const rLen = right.length;
	let l = 0;
	let r = 0;
	let pos = 0;
	for (; l<lLen && r<rLen; l++, r++)
	{	if (left.charCodeAt(l) != right.charCodeAt(r))
		{	let extraFrom=0, extraLen=0;
			let extraFromLast=0,  extraLenLast=0;
			let missingFrom=0, missingLen=0;
			let missingFromLast=0, missingLenLast=0;
			let bothDiffLen = 0;
			while (l<lLen && r<rLen)
			{	for (let li=l, ri=r; li<lLen || ri<rLen; li++, ri++)
				{	// Starting from which li the longest string from r is found?
					if (left.charCodeAt(li) == right.charCodeAt(r+extraLen))
					{	if (extraLen++ == 0)
						{	extraFrom = li - l;
						}
					}
					else if (extraLen > 0)
					{	if (extraLen > extraLenLast)
						{	extraFromLast = extraFrom;
							extraLenLast = extraLen;
						}
						const overlap = findOverlap(right, r, extraLen, left.charCodeAt(li));
						extraFrom -= overlap - 1;
						extraLen -= overlap;
					}
					// Starting from which ri the longest string from l is found?
					if (left.charCodeAt(l+missingLen) == right.charCodeAt(ri))
					{	if (missingLen++ == 0)
						{	missingFrom = li - l;
						}
					}
					else if (missingLen > 0)
					{	if (missingLen > missingLenLast)
						{	missingFromLast = missingFrom;
							missingLenLast = missingLen;
						}
						const overlap = findOverlap(left, l, missingLen, right.charCodeAt(ri));
						missingFrom -= overlap - 1;
						missingLen -= overlap;
					}
				}
				if (extraLen > extraLenLast)
				{	extraFromLast = extraFrom;
					extraLenLast = extraLen;
				}
				if (missingLen > missingLenLast)
				{	missingFromLast = missingFrom;
					missingLenLast = missingLen;
				}
				if (extraLenLast>0 || missingLenLast>0)
				{	break;
				}
				bothDiffLen++;
				l++;
				r++;
			}
			let from=0, len=0, isExtra=true;
			if (extraLenLast > len)
			{	from = extraFromLast;
				len = extraLenLast;
			}
			if (missingLenLast > len)
			{	from = missingFromLast;
				len = missingLenLast;
				isExtra = false;
			}
			// add equal part?
			if (l-bothDiffLen > pos)
			{	diffHandler.addEqual(left.slice(pos, l-bothDiffLen));
			}
			// add non-equal part
			if (len == 0)
			{	diffHandler.addDiff(left.slice(l-bothDiffLen, lLen), right.slice(r-bothDiffLen, rLen));
				pos = l = lLen;
				r = rLen;
				break;
			}
			if (isExtra)
			{	if (bothDiffLen > 0)
				{	diffHandler.addDiff(left.slice(l-bothDiffLen, l+from), right.slice(r-bothDiffLen, r));
				}
				else
				{	diffHandler.addDiff(left.slice(l, l+from), '');
				}
				l += from;
				pos = l;
				l += len - 1; // will l++ on the next iter
				r += len - 1; // will r++ on the next iter
			}
			else
			{	if (bothDiffLen > 0)
				{	diffHandler.addDiff(left.slice(l-bothDiffLen, l), right.slice(r-bothDiffLen, r+from));
				}
				else
				{	diffHandler.addDiff('', right.slice(r, r+from));
				}
				r += from;
				pos = l;
				l += len - 1; // will l++ on the next iter
				r += len - 1; // will r++ on the next iter
			}
		}
	}
	if (l > pos)
	{	diffHandler.addEqual(left.slice(pos, l));
	}
	if (l < lLen)
	{	diffHandler.addDiff(left.slice(l, lLen), '');
	}
	else if (r < rLen)
	{	diffHandler.addDiff('', right.slice(r, rLen));
	}
	return diffHandler + '';
}

function findOverlap(str: DiffSubj, from: number, len: number, nextChar: number)
{	const to = from + len;
	// find `str.slice(from, to-i) == str.slice(from+i, to)` followed by `nextChar`
L:	for (let i=1; i<to-from; i++)
	{	if (str.charCodeAt(to-i) == nextChar)
		{	for (let j=from+i; j<to; j++)
			{	if (str.charCodeAt(j) != str.charCodeAt(j-i))
				{	continue L;
				}
			}
			return len - (to - from - i + 1);
		}
	}
	return len;
}
