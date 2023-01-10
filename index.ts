import './style.css';

import { of, map, Observable, filter, delay, expand, take } from 'rxjs';

interface Customer {
  id: string;
  name: string;
}

interface Bonus {
  customerId: string;
  name: string;
}

const customers: Customer[] = [
  { id: '1', name: 'customer1' },
  { id: '2', name: 'customer2' },
];
const bonuses: Bonus[] = [
  { customerId: '1', name: 'bonus1' },
  { customerId: '2', name: 'bonus2' },
];

function getBonus(customerId: string): Observable<Bonus> {
  return of(bonuses).pipe(
    map((bonuses) =>
      bonuses.filter((bonus) => bonus.customerId === customerId)
    ),
    map((bonuses) => bonuses[0]),
    filter(Boolean),
    delay(200)
  );
}

function combineWith<TSource, TResult>(
  project: (x: TSource) => Observable<TResult>
) {
  return function (
    source: Observable<TSource>
  ): Observable<[TSource, TResult]> {
    return new Observable((subscriber) => {
      const subscription = source.subscribe({
        next(value) {
          project(value)
            .pipe(take(1))
            .subscribe({
              next(result) {
                subscriber.next([value, result]);
              },
              error(error) {
                subscriber.error(error);
              },
            });
        },

        error(error) {
          subscriber.error(error);
        },

        complete() {
          subscriber.complete;
        },
      });

      return () => subscription.unsubscribe();
    });
  };
}

of(customers[0])
  .pipe(combineWith((customer) => getBonus(customer.id)))
  .subscribe((x) => console.log(x));

of(customers[0])
  .pipe(combineWith((customer) => getBonus(customer.id)))
  .subscribe((x) => console.log(x));
