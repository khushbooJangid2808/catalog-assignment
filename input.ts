type Point = { x: bigint; y: bigint };

class BigRat {
  n: bigint;
  d: bigint;
  constructor(n: bigint, d: bigint = 1n) {
    if (d === 0n) throw new Error("zero denominator");
    if (d < 0n) { n = -n; d = -d; }
    const g = BigRat.gcd(n < 0n ? -n : n, d);
    this.n = n / g;
    this.d = d / g;
  }
  static gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) { const t = a % b; a = b; b = t; }
    return a < 0n ? -a : a;
  }
  add(o: BigRat): BigRat { return new BigRat(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o: BigRat): BigRat { return new BigRat(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o: BigRat): BigRat { return new BigRat(this.n * o.n, this.d * o.d); }
  div(o: BigRat): BigRat { return new BigRat(this.n * o.d, this.d * o.n); }
  isInt(): boolean { return this.d === 1n; }
  toString(): string { return this.d === 1n ? this.n.toString() : `${this.n}/${this.d}`; }
}

function parseInBase(s: string, base: number): bigint {
  const map: Record<string, number> = {};
  "0123456789abcdefghijklmnopqrstuvwxyz".split("").forEach((ch, i) => map[ch] = i);
  let v = 0n;
  for (const ch of s.toLowerCase()) {
    if (!(ch in map) || map[ch] >= base) throw new Error(`invalid digit '${ch}' for base ${base}`);
    v = v * BigInt(base) + BigInt(map[ch]);
  }
  return v;
}

function polyMul(a: BigRat[], b: BigRat[]): BigRat[] {
  const res: BigRat[] = Array(a.length + b.length - 1).fill(0).map(() => new BigRat(0n));
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      res[i + j] = res[i + j].add(a[i].mul(b[j]));
  return res;
}

function polyAdd(a: BigRat[], b: BigRat[]): BigRat[] {
  const n = Math.max(a.length, b.length);
  const res: BigRat[] = Array(n).fill(0).map(() => new BigRat(0n));
  for (let i = 0; i < n; i++) {
    const ai = i < a.length ? a[i] : new BigRat(0n);
    const bi = i < b.length ? b[i] : new BigRat(0n);
    res[i] = ai.add(bi);
  }
  return res;
}

function polyEvalInt(p: BigRat[], x: bigint): BigRat {
  let acc = new BigRat(0n);
  let pow = new BigRat(1n);
  for (const c of p) {
    acc = acc.add(c.mul(pow));
    pow = pow.mul(new BigRat(x));
  }
  return acc;
}

function lagrange(points: Point[]): BigRat[] {
  const k = points.length;
  let P: BigRat[] = [new BigRat(0n)];
  for (let i = 0; i < k; i++) {
    let numer: BigRat[] = [new BigRat(1n)];
    let denom = new BigRat(1n);
    for (let j = 0; j < k; j++) if (j !== i) {
      numer = polyMul(numer, [new BigRat(-points[j].x), new BigRat(1n)]);
      denom = denom.mul(new BigRat(points[i].x - points[j].x));
    }
    const scale = new BigRat(points[i].y).div(denom);
    const term = numer.map(c => c.mul(scale));
    P = polyAdd(P, term);
  }
  return P;
}

(async () => {
  const fs = await import("fs");
  const input = await new Promise<string>(resolve => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => resolve(data));
  });
  const J = JSON.parse(input);
  const n: number = J.keys.n;
  const k: number = J.keys.k;
  const pts: Point[] = [];
  for (const key of Object.keys(J)) {
    if (key === "keys") continue;
    const x = BigInt(parseInt(key, 10));
    const base = parseInt(J[key].base, 10);
    const y = parseInBase(J[key].value, base);
    pts.push({ x, y });
  }
  pts.sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0));
  const use = pts.slice(0, k);
  const P = lagrange(use);
  const ok = pts.every(p => {
    const val = polyEvalInt(P, p.x);
    return val.n === p.y && val.d === 1n;
  });
  const m = k - 1;
  console.log(`degree m = ${m}`);
  console.log(`fits all n points = ${ok}`);
  console.log("coefficients a_0..a_m (ascending powers):");
  console.log(P.slice(0, m + 1).map(c => c.toString()).join(" "));
})();
