const canvas = document.querySelector('canvas');

const  c = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;
const scoreEl = document.querySelector("#scoreEl")
const startGamebtn = document.querySelector("#startGameEl")

const modalEl = document.querySelector("#modalEl")
const bigScoreEl = document.querySelector("#bigScoreEl")

//class tạo đối tượng
class Player{
    constructor(x,y,radius,color) {

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        // this.listenMouseEvent();

    }
    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
    }

    // listenMouseEvent() {
    //     this.player.addEventListener('mousemove', (event) => {
    //         let rect = this.player.canvas.getBoundingClientRect();
    //         this.processMouseMove({
    //             x: event.clientX - rect.left,
    //             y: event.clientY - rect.top
    //         });
    //     })
    // }
    //
    // processMouseMove(mousePos) {
    //     console.log(mousePos);
    //     this.angle = Math.atan2(
    //         //GOC CUA SNAKEK TOI CON TRO CHUOT
    //         mousePos.y - (canvas.height / 2),
    //         mousePos.x - (canvas.width / 2)
    //     )
    // }
}

//tạo đối tượng projectile gồm các thuộc tính x,y,radius,color và tốc độ
class Projectile{
    constructor(x,y,radius,color,velocity) {
        this.x = x;
        this.y= y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    //function vẽ canvans
    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
    }
    //hàm update
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}

class Enemy{
    constructor(x,y,radius,color,velocity) {
        this.x = x;
        this.y= y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    //function vẽ canvans
    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0,
            Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
    }
    //hàm update
    update(){
        this.draw();
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }

}

const friction = 0.99
class Particle{
    constructor(x,y,radius,color,velocity) {
        this.x = x;
        this.y= y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpla = 1
    }
    //function vẽ canvans
    draw(){
        c.save()
        c.globalAlpha = this.alpla
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0,
            Math.PI * 2, false)
        c.fillStyle = this.color;
        c.fill()
        c.restore()
    }
    //hàm update
    update(){
        this.draw();
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
        this.alpla -= 0.01
    }

}

const  x = canvas.width/2;
const  y = canvas.height/2;

let  player = new Player(x,y,10,'white')
let projectiles = [];
let  enemies = [];
let  particles = [];

function  init(){
    player = new Player(x,y,10,'white')
    projectiles = [];
    enemies = [];
    particles = [];
    score =0;
    scoreEl.innerHTML = score;
    bigScoreEl.innerHTML = score;
}



function  spawnEnemies(){
//bong nho dan, random to nho begin
    setInterval(() => {
        const radius = Math.random() * 30;

        let x;
        let y;
        //bong day dac don
        if (Math.random() < 0.5){
         x =Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
         y = Math.random() * canvas.height;
        }else {
            x = Math.random() * canvas.width;
            y =Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
        }
        //random color for object
        const color = `hsl(${Math.random() * 360} ,50%,50%)`
//end

        const  angle = Math.atan2(
            canvas.height/2 - y,
            canvas.width/2 - x
        )
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x,y,radius,color,velocity))
        console.log(enemies)

    },1000)
}

let animationId
let score =0;
function animate(){
    //end1
    animationId = requestAnimationFrame(animate)
    //game1
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0,0,canvas.width,canvas.height)
    player.draw();

    particles.forEach((particle,index) =>{
        if (particle.alpla <= 0){
            particles.splice(index,1)
        }else{
            particle.update();
        }

    } )

    projectiles.forEach((projectile, index) => {
        projectile.update();
//remove form edges of screen
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height)
        {setTimeout(() => {

                projectiles.splice(index, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy,index) => {
        enemy.update();

        const dist =Math.hypot(player.x - enemy.x,
            player.y - enemy.y)

        //end game
        if (dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)

            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }


            //remove enemy when projectile hit
        projectiles.forEach((projectile, projectileIndex) => {
            const dist =Math.hypot(projectile.x - enemy.x,
                projectile.y - enemy.y)
            //when projectiles touch enemy ( object touch) object to ban nhieu lan moi clear
            //create explosions
            if (dist - enemy.radius - projectile.radius < 1){

                //increase out score

                for (let i = 0; i < enemy.radius ; i++) {
                     particles.push(new Projectile(projectile.x,
                        projectile.y, Math.random() * 0.5,enemy.color,
                        {x: (Math.random() - 0.5) * (Math.random() * (8)),
                                y: (Math.random() - 0.5) * (Math.random() * (8))
                        }))
                }
//chinh sua ban may lan thi het object
                if (enemy.radius - 10 > 12){

                    score += 100;
                    scoreEl.innerHTML = score

                    gsap.to(enemy, {
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }else {

                    //remove form scene altogether
                    score += 250;
                    scoreEl.innerHTML = score;

                setTimeout(() => {
                    enemies.splice(index,1)
                    projectiles.splice(projectileIndex, 1)
                }, 0)
                }
            }
        })
    })

}

addEventListener('click', (event) => {

    const  angle = Math.atan2(
        event.clientY - canvas.height/2,
        event.clientX - canvas.width/2
    )
    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    }
    projectiles.push(new Projectile(
            canvas.width/2,canvas.height/2,5,
        'white',velocity)
        )
})
addEventListener('mousemove', (event) => {
    const  angle = Math.atan2(
        event.clientY - canvas.height/2,
        event.clientX - canvas.width/2
    )
    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    }
    projectiles.push(new Projectile(
        canvas.width/2,
        canvas.height/2,5,'while',velocity
    ))
})




startGamebtn.addEventListener('click', () =>{
    init()
    animate()
    spawnEnemies()
    modalEl.style.display = 'none'
} )
// startGamebtn.addEventListener('mousemove', () =>{
//     init()
//     animate()
//     spawnEnemies()
//     modalEl.style.display = 'none'
// })
