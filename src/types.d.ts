type A1<T1> = (a: T1) => void;
type A2<T1, T2> = (a: T1, b: T2) => void;
type A3<T1, T2, T3> = (a: T1, b: T2, c: T3) => void;

type F1<T1> = () => T1;
type F2<T1, T2> = (a: T1) => T2;
type F3<T1, T2, T3> = (a: T1, b: T2) => T3;

type Predicate<T> = F2<T, boolean>;
