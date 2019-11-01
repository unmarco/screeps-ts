interface CanDoSomething {
    doSomething: () => string;
    doSomeOtherThing?: () => number;
}

class Animal implements CanDoSomething {
    public name: string = 'animal';
    public furry: boolean = true;

    public doSomething(): string {
       return 'I am an animal';
    }
}

class Person implements CanDoSomething {
    public name: string = 'person';

    public doSomething(): string {
       return 'I am NOT an animal';
    }
}

class Movie implements CanDoSomething {
    public title: string = 'movie';

    public doSomething(): string {
        return 'Watch me';
    }
}


function doStuffWith(param: { doSomething: () => string }) {
    console.log(param.doSomething());
}

let a = new Animal();
let p = new Person();
let m = new Movie();

let things: CanDoSomething[] = [a, p, m];

things.forEach(t => {
    t.doSomething()
});
