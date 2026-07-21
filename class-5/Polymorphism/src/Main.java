//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.
void main() {
    //TIP Press <shortcut actionId="ShowIntentionActions"/> with your caret at the highlighted text
    // to see how IntelliJ IDEA suggests fixing it.
       /* Student s1  = new Student("Mainak", 28);
        s1.print("Math");
        s1.print();

        Labrador l1 = new Labrador();
        l1.doBark();

        Pomeranian p1 = new Pomeranian();
        p1.doBark();

        Dog d1 = new Labrador();
        d1.doBark();

        Dog d2 = new Pomeranian();
        d2.doBark();*/

        DogSoundManager dsm = new DogSoundManager();
        dsm.makeSound(new Labrador());

        dsm.makeSound(new Pomeranian());
}
