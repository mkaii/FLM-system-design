public class Student {

    private String name;
    private int age;

    public Student(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    /// /////// /////// /////// /////// /////// /////// /////// /////// ////

    public void print(){
        System.out.println(this.name+" "+this.age);
    }

    public void print(String test){
        System.out.println(this.name+" "+this.age + " is taking a " + test);
    }

}
