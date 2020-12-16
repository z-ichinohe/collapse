var ga={},gas=[];
var plot1,plot2,plot3,plot4,plot5,plot6,plot7,plot8,plot9,plot10,plot11;
var sint1,sint2,sint3,sint4,sint51,sint52;
var chap4table=["<tr><th>No.</th><th>G.M.</th><th>Amp.</th><th>Result</th></tr>"];
var chap5table=["<tr><th>NoGM*</th><th>MCA*</th><th>StD*</th></tr>"];
var metroColors=["#f39700","#e60012","#9caeb7","#00a7db","#009944","#d7c447","#9b7cb6","#00ada9","#bb641d"];
var developColors=["#9fc4e7","#c2ddb6","#f8cb9c","#ff7f7f"];

window.onload=()=>{
    elem("plot7range").addEventListener('input',(event)=>elem("plot7amp").value=event.target.value);
}

function paramSet(str,par){
    if(str==="lambda"){
        setting.system.ls=par;
        setting.system.lc=par;
        setting.system.la=par;
        setting.system.lk=par;
    }else if(str==="dp"){
        setting.system.dp=par;
        setting.system.dpc=(1+setting.system.as*setting.system.dp)/setting.system.ac;
        setting.system.du=setting.system.dp*1+setting.system.dpc*1+1;   
    }else if(str==="as"){
        setting.system.as=par;    
    }else if(str==="ac"){
        setting.system.ac=par;
        setting.system.dpc=(1+setting.system.as*setting.system.dp)/setting.system.ac;
        setting.system.du=setting.system.dp*1+setting.system.dpc*1+1;   
    }
}

function elem(id){
    return document.getElementById(id);
}

const openFile=()=>{
    const DATA_URL = './gmset.json';
    fetch(DATA_URL)
    .then(function(response){
        return response.json();
    })
    .then(function(jsonData){
        gas=jsonData;
    });
}

openFile();

function gm_random(n){
    let gmset;
    if(n>gas.length){
        gmset=gas;
        console.log("You ordered more than 30, our limitaion")
    }else{
        let idxarr=[];
        while(idxarr.length<n){
            const newidx=Math.floor(Math.random()*gas.length);
            if(!idxarr.some(v=>v===newidx)) idxarr.push(newidx);
        }
        gmset=idxarr.map(val=>gas[val]);
        if(n===1) gmset=gmset[0];
    }
    return gmset;
}

function Chapter1(){
    elem("chap1progress").value=0;
    ga=gm_random(1);
    const system=vector(setting.system),control=setting.control;
    control.amp=0.6;
    const result=sdf(system,ga,control);
    const dt=ga.dt,dspmat=[arrSca(result.dsp,1/system.h)],gacc=result.gacc;
    if(sint1) clearInterval(sint1);
    if(plot1) plot1.destroy();
    if(plot2) plot2.destroy();
    let label1=dspmat.map((val,idx)=>String(idx+1));
    let dsp=transpose(dspmat);
    dsp[0].unshift(0);
    label1.unshift("0");
    const gaccMax=gacc.reduce((acc,cur)=>Math.max(acc,cur));
    plot1=new Chart(elem("plot1"),{
        type:'line',
        data:{
            labels:label1,
            datasets:[{
                label:"Displacement",
                data:dsp[0],  
                borderColor:"#000000",  
            }],
        },
        options:{
            animation:false,
            scales:{
                yAxes:[{
                    ticks:{
                        max:0.132,
                        min:-0.132,
                    }
                }]
            }
        }
    });
    plot2=new Chart(elem("plot2"),{
        type:'scatter',
        data:{
            datasets:[{
                label:"Inputted Ground Motion of "+ga.name+" *"+String(control.amp),
                type:'line',
                lineTension:0,
                data:gacc.map((v,j)=>{return {x:j*dt,y:v}}),
                pointRadius:0,
                borderColor:"#000000",
                borderJoinStyle:'round',
                borderCapStyle:'round',
            }],
        },
        options:{
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        max:0,
                        min:-4,
                    }
                }],
                yAxes:[{
                    ticks:{
                        max:gaccMax,
                        min:-gaccMax,
                    }
                }],
            }
        }
    });
    const begin=performance.now();
    let i=1,color=0;
    sint1=setInterval(()=>{
        elem("chap1progress").value=i/(dsp.length-1);
        if(i>dsp.length-1){
            console.log(performance.now()-begin);
            clearInterval(sint1);
        }else{
            if(dsp[i].length<dsp[0].length) dsp[i].unshift(0);
            plot1.data.datasets[0].data=dsp[i];
            if(Math.abs(dsp[i][1])<0.01) color=0;
            else if(Math.abs(dsp[i][1])<(1+system.dp[0])*0.01) color=1;
            else if(result.frc[i]!=0) color=2;
            else color=3;
            plot1.data.datasets[0].backgroundColor=developColors[color];
            plot2.options.scales.xAxes[0].ticks={max:dt*i,min:dt*i-4};
            plot1.update();
            plot2.update();
            i=Math.floor((performance.now()-begin)/dt/1000);   
        } 
    },1);
}

function Chapter2(){
    elem("chap2progress").value=0;
    setting.system.md=12;
    const system=vector(setting.system);
    const property=system_property(system);
    setting.system.md=31;
    let hyst=property.hyst[0];
    if(!hyst.du) hyst.du=system.du[0]*hyst.dy;
    let result={dsp:[],frc:[0]};
    for(let t=0; t<600*Math.floor(system.du[0]-1); t++) result.dsp.push(Math.floor(2+t/600)*Math.sin(t*Math.PI/100)*hyst.dy/2);
    let hctrl=property.hctrl[0];
    hctrl.ss=property.ss[0];
    hctrl.ff=result.frc[0];
    for(let i=0; i<result.dsp.length-1; i++){
        hctrl=restoring_force(hctrl.ss,result.dsp[i],result.dsp[i+1],hctrl.ff,hyst,hctrl);
        result.frc[i+1]=hctrl.ff;
    }
    const dsp=arrSca(result.dsp,1/system.h),frc=arrSca(result.frc,1/system.fy);
    if(sint2) clearInterval(sint2);
    if(plot3) plot3.destroy();
    if(plot4) plot4.destroy();
    const data=dsp.map((v,j)=>{return {x:v,y:frc[j]}});
    plot3=new Chart(elem("plot3"),{
        type:'scatter',
        data:{
            datasets:[{
                label:"Clough(Non-Deteriorating) Model",
                type:'line',
                lineTension:0,
                data:[data[0]],
                pointRadius:0,
                borderColor:"#000000",
                borderJoinStyle:'round',
                borderCapStyle:'round',
            }],
        },
        options:{
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        max:0.07,
                        min:-0.07,
                    }
                }],
                yAxes:[{
                    ticks:{
                        max:1.5,
                        min:-1.5,
                    }
                }],
            }
        }
    });
    plot4=new Chart(elem("plot4"),{
        type:'scatter',
        data:{
            datasets:[{
                label:"Inputted Displacement",
                type:'line',
                lineTension:0,
                data:dsp.map((v,j)=>{return {x:j,y:v}}),
                pointRadius:0,
                borderColor:"#000000",
            }],
        },
        options:{
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        max:0,
                        min:-3600,
                    }
                }],
                yAxes:[{
                    ticks:{
                        max:0.07,
                        min:-0.07,
                    }
                }],
            }
        }
    });
    const begin=performance.now();
    let i=1;
    sint2=setInterval(()=>{
        elem("chap2progress").value=i/(dsp.length-1);
        if(i>dsp.length-1){
            plot3.data.datasets[0].fill=false;
            plot3.update();
            console.log(performance.now()-begin);
            clearInterval(sint2);
        }else{
            plot3.data.datasets[0].data=data.slice(0,i);
            plot4.options.scales.xAxes[0].ticks={max:i,min:i-3600};
            plot3.update();
            plot4.update();
            i=Math.floor((performance.now()-begin)*7.2/10);
        }
    },0.0001);
}

function Chapter3(){
    elem("chap3progress").value=0;
    const system=vector(setting.system);
    const property=system_property(system);
    let hyst=property.hyst[0];
    if(!hyst.du) hyst.du=system.du[0]*hyst.dy;
    let result={dsp:[],frc:[0]};
    for(let t=0; t<600*Math.floor(system.du[0]-1); t++) result.dsp.push(Math.floor(2+t/600)*Math.sin(t*Math.PI/100)*hyst.dy/2);
    let hctrl=property.hctrl[0];
    hctrl.ss=property.ss[0];
    hctrl.ff=result.frc[0];
    for(let i=0; i<result.dsp.length-1; i++){
        hctrl=restoring_force(hctrl.ss,result.dsp[i],result.dsp[i+1],hctrl.ff,hyst,hctrl);
        result.frc[i+1]=hctrl.ff;
    }
    const dsp=arrSca(result.dsp,1/system.h),frc=arrSca(result.frc,1/system.My);
    if(sint3) clearInterval(sint3);
    if(plot5) plot5.destroy();
    const data=dsp.map((v,j)=>{return {x:v,y:frc[j]}});
    plot5=new Chart(elem("plot5"),{
        type:'scatter',
        data:{
            datasets:[{
                label:"IMK-Peak-Oriented Model (with Deterioration)",
                type:'line',
                lineTension:0,
                data:[data[0]],
                pointRadius:0,
                borderColor:"#000000",
                borderJoinStyle:'round',
                borderCapStyle:'round',
            }],
        },
        options:{
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        max:0.07,
                        min:-0.07,
                    }
                }],
                yAxes:[{
                    ticks:{
                        max:1.5,
                        min:-1.5,
                    }
                }],
            }
        }
    });
    const begin=performance.now();
    var i=1;
    sint3=setInterval(()=>{
        elem("chap3progress").value=i/(dsp.length-1);
        if(i>dsp.length-1){
            plot5.data.datasets[0].fill=false;
            plot5.update();
            console.log(performance.now()-begin);
            clearInterval(sint3);
        }else{
            plot5.data.datasets[0].data=data.slice(0,i);
            plot5.update();
            i=Math.floor((performance.now()-begin)*7.2/10);
        }
    },1);
}

function Chapter31(){
    const system=vector(setting.system);
    let property=system_property(system);
    let hyst=property.hyst[0];
    if(!hyst.du) hyst.du=system.du[0]*hyst.dy;
    let result={dsp:[[],[]],frc:[[0],[0]]};
    for(let t=0; t<600*Math.floor(system.du[0]-1); t++) result.dsp[0].push(Math.floor(2+t/600)*Math.sin(t*Math.PI/100)*hyst.dy/2);
    for(let i=0; i<hyst.du[1]*1.1; i+=hyst.dy/100) result.dsp[1].push(i);
    let datasets=[];
    const labels=["Cyclic","Monotonic"];
    result.dsp.forEach((val,idx)=>{
        datasets[idx]={
            label:labels[idx],
            type:'line',
            lineTension:0,
            data:[{x:0,y:0}],
            pointRadius:0,
            fill:false,
            borderColor:"#000000",
            borderJoinStyle:'round',
            borderCapStyle:'round',
        };
        property=system_property(system);
        hyst=property.hyst[0];
        let hctrl=property.hctrl[0];
        hctrl.ss=property.ss[0];
        hctrl.ff=0;
        for(let i=0; i<val.length-1; i++){
            hctrl=restoring_force(hctrl.ss,val[i],val[i+1],hctrl.ff,hyst,hctrl);
            result.frc[idx][i+1]=hctrl.ff;
            datasets[idx].data[i+1]={x:val[i+1]/system.h,y:hctrl.ff/system.My};
        }
    });
    if(plot6) plot6.destroy();
    plot6=new Chart(elem("plot6"),{
        type:'scatter',
        data:{
            datasets:datasets,
        },
        options:{
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        max:0.07,
                        min:-0.07,
                    }
                }],
                yAxes:[{
                    ticks:{
                        max:1.5,
                        min:-1.5,
                    }
                }],
            }
        }
    });
}

function Chapter4(){
    elem("chap4progress").value=0;
    const system=vector(setting.system);
    let control=setting.control;
    control.amp=Number(elem("plot7amp").value);
    if(!control.amp||control.amp===0){
        control.amp=1.0;
        elem("plot7amp").value="1.0";
    }
    elem("plot7range").value=elem("plot7amp").value;
    const result=sdf(system,ga,control);
    chap4table.push(["<tr><th>",String(chap4table.length),".</th><td>",ga.name,"</td><td>",String(control.amp),"</td><td>",result.collapse,"</td></tr>"].join(""));
    let table4=chap4table.map(val=>val);
    table4.unshift("<table>");
    table4.push("</table>");
    elem("chap4table").innerHTML=table4.join("");
    setting.control.amp=0.6;
    const dt=ga.dt,dspmat=[arrSca(result.dsp,1/system.h)];
    if(sint4) clearInterval(sint4);
    if(plot7) plot7.destroy();
    let label1=dspmat.map((val,idx)=>String(idx+1));
    let dsp=transpose(dspmat);
    dsp[0].unshift(0);
    label1.unshift("0");
    plot7=new Chart(elem("plot7"),{
        type:'line',
        data:{
            labels:label1,
            datasets:[{
                label:"Displacement",
                data:dsp[0],   
                borderColor:"#000000", 
            }],
        },
        options:{
            animation:false,
            scales:{
                yAxes:[{
                    ticks:{
                        max: system.du*system.My/system.se/system.h,
                        min:-system.du*system.My/system.se/system.h,
                    }
                }]
            }
        }
    });
    let begin=performance.now();
    let i=1,color=0;
    sint4=setInterval(()=>{
        elem("chap4progress").value=i/(dsp.length-1);
        if(i>dsp.length-1){
            console.log(performance.now()-begin);
            clearInterval(sint4);
        }else{
            if(dsp[i].length<dsp[0].length) dsp[i].unshift(0);
            if(Math.abs(dsp[i][1])<0.01) color=0;
            else if(Math.abs(dsp[i][1])<(1+system.dp[0])*0.01) color=1;
            else if(result.frc[i]!=0) color=2;
            else color=3;
            plot7.data.datasets[0].backgroundColor=developColors[color];
            plot7.data.datasets[0].data=dsp[i];
            plot7.update();
            i=Math.floor((performance.now()-begin)/dt/1000);
        }    
    },0.01);
}

function Chapter5(){
    elem("chap5progress").value=0;
    let n=Number(elem("plot8no").value);
    if(!n||n===0){
        n=5;
        elem("plot8no").value="5";
    }
    const perbegin=performance.now();
    if(sint51) clearInterval(sint51);
    if(sint52) clearInterval(sint52);
    const system=vector(setting.system);
    let control=setting.control;
    const gmset=gm_random(n);
    if(plot8) plot8.destroy();
    plot8=new Chart(elem("plot8"),{
        type:'scatter',
        data:{
            datasets:[{
                type:'line',
                lineTension:0,
                data:[{x:0,y:0}],
                pointRadius:0,
                fill:false,
                borderColor:"#000000",
            }],
        },
        options:{
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        max:0.455,
                        min:0.0,
                    }
                }],
                yAxes:[{
                    ticks:{
                        max:1.0,
                        min:0.0,
                    }
                }],
            }
        }
    });
    const sdfida=async(gm,idx,system,control,plot8)=>{
        control.tend=gm.dt*gm.acc.length;
        plot8.data.datasets[idx]={
            label:gm.name,
            type:'line',
            lineTension:0,
            data:[{x:0,y:0}],
            fill:false,
            borderColor:metroColors[idx%metroColors.length],
            borderWidth:2,
        };
        let supamp=5.8,supdef=0,itr=0,infamp=0;   
        const interv1=()=>new Promise(resolve=>{ 
            sint51=setInterval(()=>{
                control.amp=0.2+itr*0.1;
                if(itr>30) clearInterval(si);
                const result=sdf(system,gm,control);
                const defmax=result.dsp.reduce((acc,val)=>Math.max(Math.abs(acc),Math.abs(val)));
                if(defmax>system.du*system.My/system.se){
                    supamp=control.amp;
                    supdef=defmax;
                    resolve();
                    clearInterval(sint51);
                }else{
                    infamp=control.amp;
                    plot8.data.datasets[idx].data.push({x:defmax,y:control.amp});
                    plot8.update();  
                    itr++;          
                }
            },1);
        });
        const interv2=()=>new Promise(resolve=>{
            sint52=setInterval(()=>{
                if((supamp-infamp)<0.001){
                    resolve();
                    clearInterval(sint52);
                }else{
                    control.amp=(infamp+supamp)/2;
                    const result=sdf(system,gm,control);
                    const defmax=result.dsp.reduce((acc,val)=>Math.max(Math.abs(acc),Math.abs(val)));
                    if(defmax>system.du*system.My/system.se){
                        supamp=control.amp;
                        supdef=defmax;
                    }else{
                        infamp=control.amp;
                        plot8.data.datasets[idx].data.push({x:defmax,y:control.amp});
                        plot8.update(); 
                        itr++;          
                    }
                }
            },1);
        });
        const interv3=()=>new Promise(resolve=>{
            plot8.data.datasets[idx].data.push({x:supdef,y:supamp});
            plot8.update();
            resolve(supamp);
        });
        await interv1();
        await interv2();
        return await interv3();
    }
    let idx=0,ampres=[];
    const start=async ()=>{
        for (const gm of gmset){
           ampres[idx]=await sdfida(gm,idx,system,control,plot8);
           elem("chap5progress").value=(idx+1)/gmset.length;
           idx++;
           console.log(performance.now()-perbegin);
        }
    }
    start().then(()=>{
        const mean=sum(ampres)/ampres.length;
        chap5table.push(["<tr><th>",String(gmset.length),"</th><td>",mean.toFixed(3),"</td><td>",Math.sqrt(sum(ampres.map(val=>(val-mean)**2))/ampres.length).toFixed(3),"</td></tr>"].join(""));
        let table5=chap5table.map(val=>val);
        table5.unshift("<table>");
        table5.push("</table>");
        elem("chap5table").innerHTML=table5.join("");
        setting.control.amp=0.6;
    });
}
    
function ones(row,col,num){
    let b=[];
    for(let i=0; i<row; i++){
        let a=[];
        for(let j=0; j<col; j++) a[j]=num;
        b[i]=a;
    }
    return b;
}

const sum=(arr)=>arr.reduce((acc,cur)=>acc+=cur);
const arrDot=(arr1,arr2)=>arr1.reduce((acc,val,idx)=>acc*1+val*arr2[idx],0);
const arrDiv=(arr1,arr2)=>arr1.map((v,i)=>v=v/arr2[i]);
const arrAdd=(arrarr)=>transpose(arrarr).map(val=>sum(val));
const matSca=(mat,scal)=>mat.map(data=>data.map(data=>data*scal));
const arrSca=(arr,scal)=>matSca([arr],scal)[0];

function renamer(hctrl){
    let hctrl1={};
    for(key in hctrl){
        if(Array.isArray(hctrl[key])) hctrl1[key]=hctrl[key].map(val=>val);
        else hctrl1[key]=hctrl[key];
    }
    return hctrl1;
}

function transpose(arr){
    let newarr=[];
    jmax=arr.length; imax=arr[0].length;
    for(let i=0;i<imax;i++){
        newarr[i]=[];
        for(j=0;j<jmax;j++) newarr[i][j]=arr[j][i];
    }
    return newarr;
}

function setter(Nst){
    let system={
        hm:0.0,
        hk:0.03,
        as:0.01,
        Res:0.0001,
        dt0:0,
        ls:100,
        lc:100,
        la:100,
        lk:100,
        cs:1,
        cc:1,
        ca:1,
        ck:1,
        D:1,
        Fpr:0.3,
        Ap:0.5,
        Nst:Nst,
        ms:ones(1,Nst,100)[0],
        h:ones(1,Nst,3.5)[0],
        md:31,
        dp:2,
        b0:0,
        ac:0.1,
    };
    let control={
        amp:0.6,
        ampinit:0.4,
        amplast:1.7  
    };
    system.My  =        Ai(system.ms,system.h);
    system.dpc =     (1+system.as*system.dp)/system.ac;
    system.du  =        system.dp+system.dpc+1;
    system.se  = arrDiv(arrDiv(system.My,ones(1,Nst,0.01)[0]),system.h);
    system.fy=system.My;
    system.au=system.as;
    if(Nst===1){
        system.ms=system.ms[0];
        system.h=system.h[0];
        system.My=system.My[0];
        system.se=system.se[0];
        system.fy=system.fy[0];
    }
    return {system:system,control:control};
}

function Ai(ms,h){
    let fy=[];
    const T=sum(h)*0.02;
    for(let i=0; i<ms.length; i++){
        const cum=sum(ms.slice(i,ms.length));
        const alphai=cum/sum(ms);
        const ai=1+(1/Math.sqrt(alphai)-alphai)*2*T/(1+3*T);
        fy.push(ai*cum*9.8*0.3);
    }
    return fy;
}

function vector(system){
    const keylist=["Nst","hm","hk"];
    for(key in system){
        if(keylist.indexOf(key)===-1&&system[key].length===undefined) system[key]=ones(1,system.Nst,system[key])[0];
    }
    return system
}

function system_property(system){
    let property={}, hyst=[], hctrl=[];
    property.Nst=system.Nst;
    property.ms=system.ms;
    property.bm=system.hm;
    property.bk=system.hk;
    property.ss=system.se.map(val=>val);
    for(let i=0; i<system.Nst;i++){
        hyst[i]={};
        hctrl[i]={};
        hyst[i].md=system.md[i];
        hyst[i].se=system.se[i];
        if(hyst[i].md===2) hyst[i].b0=system.b0[i];
        else if(10<hyst[i].md&&hyst[i].md<20){
            hyst[i].fy=system.fy[i];
            hyst[i].dy=hyst[i].fy/hyst[i].se;
            switch(hyst[i].md){
                case 11:
                case 12:
                    hyst[i].su=hyst[i].se*system.au[i];
                    hyst[i].sy=hyst[i].se;
                case 13:
                    hyst[i].b0=system.b0[i];
                default: ;
            }
        }else if(20<hyst[i].md&&hyst[i].md<29){
            hyst[i].se=hyst[i].se/system.ay[i];
            hyst[i].fc=system.fc[i];
            hyst[i].fy=system.fy[i];
            hyst[i].dc=hyst[i].fc/hyst[i].se;
            hyst[i].dy=hyst[i].fy/hyst[i].se/system.ay[i];
            hyst[i].scy=(hyst[i].fy-hyst[i].fc)/(hyst[i].dy-hyst[i].dc);
            hyst[i].su=hyst[i].se*system.au[i];
            switch(hyst[i].md){
                case 25:
                    hyst[i].b2=system.b2[i];
                    hyst[i].b3=system.b3[i];
                case 24:
                    hyst[i].b0=system.b0[i];
                    hyst[i].b1=system.b1[i];
                default: ;
            }
        }else if(hyst[i].md>30){
            hyst[i].My=system.My[i];
            hyst[i].sy=system.se[i]+0;
            hyst[i].dy=hyst[i].My/hyst[i].sy;
            hyst[i].dp=system.dp[i]*hyst[i].dy;
            hyst[i].dpc=system.dpc[i]*hyst[i].dy;
            hyst[i].du=system.du[i]*hyst[i].dy;
            hyst[i].as=system.as[i];
            hyst[i].Res=system.Res[i];
            hyst[i].dt0=system.dt0[i];
            hyst[i].ls=system.ls[i];
            hyst[i].lc=system.lc[i];
            hyst[i].la=system.la[i];
            hyst[i].lk=system.lk[i];
            hyst[i].cs=system.cs[i];
            hyst[i].cc=system.cc[i];
            hyst[i].ca=system.ca[i];
            hyst[i].ck=system.ck[i];
            hyst[i].D=system.D[i];
            const keylist=["as","My","dp","dpc","Res","du","dt0","D"];
            for(key of keylist){
                if(!isNaN(hyst[i][key])){
                    if(key==="as"||key==="Res"||key==="D") hyst[i][key]=[hyst[i][key],hyst[i][key]];
                else hyst[i][key]=[-hyst[i][key],hyst[i][key]];        
                }
            }
            if(hyst.md>31){
                hyst[i].Fpr=system.Fpr[i];
                hyst[i].Ap=system.Ap[i];
            }
            hctrl[i].fi = 0;
            hctrl[i].fri = 0;
            hctrl[i].ksi = 0;
            hctrl[i].kui = 0;
            hctrl[i].dti = 0;
            hctrl[i].e = [0,0];
            hctrl[i].ek = [0];
            hctrl[i].dm = 0;
            hctrl[i].fm = 0;
            hctrl[i].d1 = 0;
            hctrl[i].f1 = 0;
            hctrl[i].d2 = 0;
            hctrl[i].d1f = 0;
            hctrl[i].np = 0;
            hctrl[i].df = 0;
            hctrl[i].dy = 0;
        }
        hctrl[i].ll = 1;
        hctrl[i].fm = [0,0];
        hctrl[i].dm = [0,0];
        hctrl[i].s1 = [0,0];
        hctrl[i].s2 = [0,0];
        hctrl[i].f0 = 0;
        hctrl[i].f1 = 0;
        hctrl[i].f2 = 0;
        hctrl[i].f3 = 0;
        hctrl[i].f4 = 0;
        hctrl[i].f5 = 0;
        hctrl[i].f6 = 0;
        hctrl[i].f7 = 0;
        hctrl[i].f8 = 0;
        hctrl[i].d0 = 0;
        hctrl[i].d1 = 0;
        hctrl[i].d2 = 0;
        hctrl[i].d3 = 0;
        hctrl[i].d4 = 0;
        hctrl[i].d5 = 0;
        hctrl[i].d6 = 0;
        hctrl[i].d7 = 0;
        hctrl[i].d8 = 0;
        hctrl[i].x0 = 0;
        hctrl[i].x1 = 0;
        hctrl[i].x2 = 0;
        hctrl[i].x3 = 0;
    }
    property.hyst=hyst;
    property.hctrl=hctrl;
    return property;
}

function restoring_force(ss,ds,dd,fs,hyst,hctrl){
    switch(hyst.md){
        case 1:
            hctrl.ff=ss*dd;
            break;
        case 2:
            if(dd>=0) ss=hyst.se;
            else ss=hyst.b0*hyst.se;
            hctrl.ff=ss*dd;
            break;
        case 12:
            hctrl=clough(ds,dd,fs,ss,hyst,hctrl);
            break;
        case 31:
            hctrl=imk_peak_o(ds,dd,fs,ss,hyst,hctrl);
            break;
        case 32:
            hctrl=imk_pinching(ds,dd,fs,ss,hyst,hctrl);
            break;
        default:console.log("error");
    }
    return hctrl;
}

function spectrum(ga){
    const h=0.05, TN=4, T0= 0.01, DT=(TN-T0)/1000;
    const gacc=ga.acc, dt=ga.dt;
    // let AA=[], T=[];
    res.t=[];
    res.aa=[];
    for(let TT=T0; TT<=TN; TT+=DT){
        res.t.push(TT);
        let a=[-gacc[0]], v=[0], d=[0], absa=[Math.abs(gacc[0])];
        const wn=2*Math.PI/TT, wd=wn*Math.sqrt(1-h**2), ex=Math.exp(-h*wn*dt), sw=Math.sin(wd*dt), cw=Math.cos(wd*dt), h1=h/Math.sqrt(1-h**2), h2=2*h**2-1;
        const A1=ex*(h1*sw+cw), A2=ex/wd*sw, A3=ex/wn**2*((h1+h2/(wd*dt))*sw+(1+2*h/(wn*dt))*cw)-2*h/(wn**3*dt), A4=-ex/(wn**2*dt)*(h2/wd*sw+2*h/wn*cw)-1/wn**2*(1-2*h/(wn*dt));
        const B1=-ex*wn/Math.sqrt(1-h**2)*sw, B2=ex*(cw-h1*sw), B3=ex*((h/wn+h2/(wn**2*dt))*(cw-h1*sw)-(1/wn**2+2*h/(wn**3*dt))*(wd*sw+h*wn*cw))+1/(wn**2*dt);
        const B4=-ex*(h2/(wn**2*dt)*(cw-h1*sw)-2*h/(wn**3*dt)*(wd*sw+h*wn*cw))-1/(wn**2*dt);
        for(let i=0; i<gacc.length-1; i++){
            d[i+1]=A1*d[i]+A2*v[i]+A3*gacc[i]+A4*gacc[i+1];
            v[i+1]=B1*d[i]+B2*v[i]+B3*gacc[i]+B4*gacc[i+1];
        	a[i+1]=-gacc[i+1]-2*h*wn*v[i+1]-wn**2*d[i+1];
        	absa[i+1]=Math.abs(a[i+1]+gacc[i+1]);
        }
        res.aa.push(Math.max.apply(null,absa));
    }
    plot([res.t],[res.aa]);
}

function sdf(system,ga,control){
    let property=system_property(system), hctrl=property.hctrl[0];
    hctrl.ss=property.ss;
    const w1=Math.sqrt(property.ss[0]/property.ms[0]);
    const cm=2*property.bm*w1*property.ms;
    let cv=cm+2*property.bk/w1*property.ss;
    const dt=ga.dt, gacc=ga.acc.map(data=>data*control.amp), tolr=1e-6, tola=1e-15;
    const coef1=dt, coef2=(dt**2)/4, coef3=(dt**2)/4, coef4=dt/2, coef5=dt/2;
    let acc=[-gacc[0]],vel=[0],dsp=[0],absacc=[0],frc=[0],dct=[0],t=[0],collapse="Not Yet";
    for(let i=0; i<gacc.length-1; i++){
        t[i]=dt*i;
        const Me=property.ms[0]+coef5*cv+coef3*property.ss[0];
        const Fe=-property.ms*gacc[i+1]-cv*(vel[i]+coef4*acc[i])-property.ss*(dsp[i]+coef1*vel[i]+coef2*acc[i]);
        let aa=Fe/Me;
        let err=0, j=0,hctrl_amp={};
        while(j<5){
            hctrl_amp=renamer(hctrl);
            dsp[i+1]=dsp[i]+coef1*vel[i]+coef2*acc[i]+coef3*aa;
            if(property.hyst[0].dy) dct[i+1]=dsp[i+1]/property.hyst[0].dy;
            vel[i+1]=vel[i]+coef4*acc[i]+coef5*aa;
            hctrl_amp=restoring_force(hctrl_amp.ss,dsp[i],dsp[i+1],frc[i],property.hyst[0],hctrl_amp);
            frc[i+1]=hctrl_amp.ff;
            if(hctrl_amp.ss>0) cv=cm+2*property.bk/w1*hctrl_amp.ss;
            else cv=cm;
            acc[i+1]=-(frc[i+1]+cv*vel[i+1])/property.ms-gacc[i+1];
            absacc[i+1]=acc[i+1]+gacc[i+1];
            err=Math.abs(acc[i+1]-aa)/(tolr*Math.abs(acc[i+1])+tola);
            if(err<1) break;
            aa=acc[i+1];
            j++;
        }
        hctrl=hctrl_amp;
        // if(1<=err) console.log(t[i]);
        if(hctrl.ll===0){
            collapse="Collapse"
            break;
        }
    }
    return {t:t,gacc:gacc,acc:absacc,vel:vel,dsp:dsp,dct:dct,frc:frc,collapse:collapse};
}

var setting=setter(1);
