import type {DiffSubj} from './diff_handler.ts';
import {DiffHandler, DiffTerm} from './diff_handler.ts';

const CR = 13;
const LF = 10;

export function diff(left: DiffSubj, right: DiffSubj, diffHandler: DiffHandler=new DiffTerm({indentWidth: 4}))
{	diffHandler.left = left;
	diffHandler.right = right;
	diffHandler.posLeft = 0;
	diffHandler.posRight = 0;
	const lLen = left.length;
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
						extraFrom += overlap + 1;
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
						missingFrom += overlap + 1;
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
			let lFrom=0, rFrom=0, len=0, subj=left, subjBase=0;
			if (extraLenLast > len)
			{	lFrom = extraFromLast;
				len = extraLenLast;
				subjBase = l + lFrom - 1;
			}
			if (missingLenLast > len)
			{	lFrom = 0;
				rFrom = missingFromLast;
				len = missingLenLast;
				subj = right;
				subjBase = r + rFrom - 1;
			}
			// add equal part?
			let endPos = l - bothDiffLen;
			let endPosRight = r - bothDiffLen;
			if (endPos > pos)
			{	diffHandler.posLeft = pos;
				diffHandler.posRight = r-(l - pos);
				if (bothDiffLen==0 && len!=0)
				{	// if it doesn't matter, shift the difference to line start
					let c;
					while (endPos>pos && (c = left.charCodeAt(endPos-1))!=CR && c!=LF && c==subj.charCodeAt(subjBase))
					{	endPos--;
						endPosRight--;
						l--;
						r--;
						subjBase--;
					}
				}
				diffHandler.addEqual(endPos);
			}
			diffHandler.posLeft = endPos;
			diffHandler.posRight = endPosRight;
			// add non-equal part
			if (len == 0)
			{	diffHandler.addDiff(lLen, rLen);
				pos = l = lLen;
				r = rLen;
				break;
			}
			diffHandler.addDiff(l+lFrom, r+rFrom);
			l += lFrom;
			r += rFrom;
			pos = l;
			l += len - 1; // will l++ on the next iter
			r += len - 1; // will r++ on the next iter
		}
	}
	if (l > pos)
	{	diffHandler.posLeft = pos;
		diffHandler.posRight = r-(l - pos);
		diffHandler.addEqual(l);
	}
	diffHandler.posLeft = l;
	diffHandler.posRight = r;
	if (l < lLen)
	{	diffHandler.addDiff(lLen, r);
	}
	else if (r < rLen)
	{	diffHandler.addDiff(l, rLen);
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
			return len - (to - from - i) - 1;
		}
	}
	return len;
}
