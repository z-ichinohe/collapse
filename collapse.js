/* Declaration */
var ga={},gas=[];
var plot10,plot11,plot20,plot21,plot22,plot30,plot40,plot50;
var sint,sint,sint3,sint4,sint,sint42;
var chap3table=["<tr><th>No.</th><th>G.M.</th><th>Amp.</th><th>Result</th></tr>"];
var chap4table=["<tr><th>NoGM*</th><th>MCA*</th><th>StD*</th></tr>"];
var metroColors=["#f39700","#e60012","#9caeb7","#00a7db","#009944","#d7c447","#9b7cb6","#00ada9","#bb641d"];
var developColors=["#9fc4e7","#c2ddb6","#f8cb9c","#ff7f7f"];
var idaresult=[],cyclic_data;

/* EventListener */
for(const key of ["chap3","chap4"]){ 
    elem("range_"+key).addEventListener("input",(event)=>elem("num_"+key).value=event.target.value);
}

/*
 clough */
elem("clough_au").addEventListener("input",(event)=>{
    setting.system.au=Number(event.target.value);
    showHyste("plot20");
});
elem("clough_se").addEventListener("input",(event)=>{
    setting.system.se=setting.system.fy[0]/Number(event.target.value)/setting.system.h[0];
    showHyste("plot20");
});

/* imk */
for(const key of ["ls","lc","lk","la","as","Res","dt0","ddu"]){
    if(["ls","lc","lk","la"].includes(key)){
        elem("imk_"+key).addEventListener("input",(event)=>{
            setting.system[key]=100*1.3**(Number(event.target.value)-5);
            showHyste("plot21");
        });
    }else if(["as","Res","dt0","ddu"].includes(key)){
        elem("imk_"+key).addEventListener("input",(event)=>{
            setting.system[key]=Number(event.target.value);
            showHyste("plot21");
        });
    }
}
elem("imk_pin_force").addEventListener("input",(event)=>{
    setting.system.Ap=setting.system.Ap[0]*Number(event.target.value)/setting.system.Fpr[0];
    setting.system.Fpr=Number(event.target.value);
    showHyste("plot21");
});
elem("imk_pin_stiff").addEventListener("input",(event)=>{
    setting.system.Ap=setting.system.Fpr[0]-Number(event.target.value);
    showHyste("plot21");
});
elem("imk_ac").addEventListener("input",(event)=>{
    setting.system.dpc=(1+setting.system.as*setting.system.dp)*Number(event.target.value);
    showHyste("plot21");
});
/* multi */
elem("multi_lambda").addEventListener("input",(event)=>{
    setting.system.lambda[0]=100*1.3**(Number(event.target.value)-5);
    showHyste("plot22");
});
elem("multi_lk").addEventListener("input",(event)=>{
    setting.system.lambda[1]=100*1.3**(Number(event.target.value)-5);
    showHyste("plot22");
});
elem("multi_pin_force").addEventListener("input",(event)=>{
    setting.system.Ap=setting.system.Ap*Number(event.target.value)/setting.system.Fpr;
    setting.system.Fpr=Number(event.target.value);
    showHyste("plot22");
});
elem("multi_pin_stiff").addEventListener("input",(event)=>{
    setting.system.Ap=setting.system.Fpr[0]-Number(event.target.value);
    showHyste("plot22");
});
/* Page Function */
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
        ga=gm_random(1)[0];
    });
}
openFile();

function loadFile(){
    var file=elem("jsonfile").files[0];
    var reader=new FileReader();
    reader.onload=(event)=>{
        gas=JSON.parse(reader.result);
        ga=gm_random(1)[0];
    }
    reader.readAsText(file);
}

function noGuidance(){
    elem("next_chap1").className="invisible";
    elem("next_chap2").className="invisible";
    elem("next_chap3").className="invisible";
    elem("next_chap4").className="invisible";
    elem("next_chap5").className="invisible";
}

function openclose(btn){
    let targetId=btn.getAttribute("href").slice(1);
    if(targetId.startsWith("button")){
        targetId=targetId.slice(7,12);
        elem(targetId).className="";
        elem("next_"+targetId).className='invisible';
        elem("download_link").href="#button_"+targetId;
        elem("download_link").click();
    }else if(targetId.startsWith("description")){
        if  (elem(targetId).className==="invisible") elem(targetId).className="text-left";
        else elem(targetId).className="invisible";    
    }else{
        if  (elem(targetId).className==="invisible") elem(targetId).className="";
        else elem(targetId).className="invisible";
    }
    return false;
}

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
        //if(n===1) gmset=gmset[0];
    }
    return gmset;
}

function po_pinch_selector(char){
    if(elem(char+"_fpr").className===""){
        elem(char+"_fpr").className="hidden";
        elem(char+"_ap").className="hidden";
        if(char==="imk"){
            setting.system.md=31;
        }else if(char==="multi"){
            setting.system.md=41;
            setting.system.Fpr=0.001;
            setting.system.Ap=1;
        }
    }else if(elem(char+"_fpr").className==="hidden"){
        elem(char+"_fpr").className="";
        elem(char+"_ap").className="";
        if(char==="imk"){
            setting.system.md=32;
        }else if(char==="multi"){
            setting.system.md=41;
            if(setting.system.Fpr==0.001) setting.system.Fpr=0.3;
        }
    }
    setting2slider();
}

function temp_selector(char){
    setting=setter(1);
    if(char==="clough"){
        setting.system.md=12;
    }else if(char==="imk"){
        setting.system.md=31;
    }else if(char="multi"){
        setting.system.md=41;
        setting.system.Ap=1;
        setting.system.Fpr=0.001;
    }
    setting2slider();
}

function setting2slider(){
    elem("clough").className="invisible";
    elem("imk").className="invisible";
    elem("multi").className="invisible";    
    if(setting.system.md==12){
        elem("clough").className="";
        elem("clough_au").value=String(setting.system.au);
        elem("clough_se").value=String(setting.system.se*setting.system.h/setting.system.fy);
        showHyste("plot20");
    }else if(setting.system.md==31||setting.system.md==32){
        elem("imk").className="";
        if(setting.system.md==31){
            elem("imk_fpr").className="hidden";
            elem("imk_ap").className="hidden";
        }else if(setting.system.md==32){
            elem("imk_fpr").className="";
            elem("imk_ap").className="";
        }
        for(const key of ["ls","lc","lk","la","as","Res","dt0","ddu"]){
            if(["ls","lc","lk","la"].includes(key)){
                elem("imk_"+key).value=String(5+Math.log(setting.system[key]/100)/Math.log(1.3));
            }else if(["as","Res","dt0","ddu"].includes(key)){
                elem("imk_"+key).value=String(setting.system[key]);
            }
        }
        elem("imk_pin_force").value=String(setting.system.Fpr);
        elem("imk_pin_stiff").value=String(setting.system.Fpr-setting.system.Ap);
        elem("imk_ac").value=String(setting.system.dpc/(1+setting.system.as*setting.system.dp));
        const dy=setting.system.My/setting.system.h/setting.system.se*100;
        slider.imk.noUiSlider.set([String(dy),String(dy*(setting.system.dp[0]+1))]);
    }else if(setting.system.md==41){
        elem("multi").className="";
        if(setting.system.Fpr==0.001){
            elem("multi_fpr").className="hidden";
            elem("multi_ap").className="hidden";   
        }else{
            elem("multi_fpr").className="";
            elem("multi_ap").className="";
        }
        elem("multi_lambda").value=String(5+Math.log(setting.system.lambda[0]/100)/Math.log(1.3));
        elem("multi_lk").value=String(5+Math.log(setting.system.lambda[1]/100)/Math.log(1.3));
        elem("multi_pin_force").value=String(setting.system.Fpr);
        elem("multi_pin_stiff").value=String(setting.system.Fpr-setting.system.Ap);
        let tr=[[],[]];
        setting.system.force.forEach((val,idx)=>{
            tr[0][idx]="<td>f"+String(idx)+"</td>";
            tr[1][idx]="<td><input type=range id=multi_f"+String(idx)+" min=0.01 max=1.5 step=0.01 class=vertical value="+String(val)+"></td>";
        });
        tr=tr.map((val)=>{
            val.unshift("<tr>");
            val.push("</tr>");
            val=val.join("");
            return val;
        });
        tr.unshift("<table>");
        tr.push("</table>");
        elem("multi_force_slider").innerHTML=tr.join("");
        setting.system.force.forEach((val,idx)=>{
            elem("multi_f"+String(idx)).addEventListener("input",()=>{
                setting.system.force[idx]=Number(elem("multi_f"+String(idx)).value);
                showHyste("plot22");
            });
        });
        slider.multi.noUiSlider.destroy();
        noUiSlider.create(slider.multi,{
            start:setting.system.disp.map(val=>val*100),
            step:0.2,
            margin:0.2,
            range:{
                min:0.6,
                max:15,
            },
        });
        slider.multi.noUiSlider.on("update",(values)=>{
            setting.system.disp=values.map(val=>Number(val)/100);
            showHyste("plot22");
        });
    }
}

/* Chapter Function */
function Chapter1(){
    button_switch("chap1","start");
    elem("progress_chap1").value=0;
    ga=gm_random(1)[0];
    const system=vector(setting.system),control=setting.control;
    control.amp=0.6;
    const result=sdf(system,ga,control);
    const dt=ga.dt,dspmat=[result.dsp.map(val=>val/system.h)],gacc=result.gacc;
    if(sint) clearInterval(sint);
    if(plot10) plot10.destroy();
    if(plot11) plot11.destroy();
    const gaccMax=gacc.reduce((acc,cur)=>Math.max(acc,cur));
    let label1=dspmat.map((val,idx)=>String(idx+1));
    label1.unshift("0");
    const dsp=transpose(dspmat).map((val)=>{
        val.unshift(0);
        return val;
    });
    cyclic_data={
        data:result.dsp.map((val,idx)=>{return {x:val/system.h[0],y:result.frc[idx]/system.My[0]}}),
        dt:dt,
    };
    plot10=new Chart(elem("plot10"),{
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
                        max:0.07,
                        min:-0.07,
                    }
                }]
            }
        }
    });
    plot11=new Chart(elem("plot11"),{
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
    sint=setInterval(()=>{
        elem("progress_chap1").value=i/(dsp.length-1);
        if(i>dsp.length-1){
            console.log(performance.now()-begin);
            button_switch("chap1","stop");
        }else{
            plot10.data.datasets[0].data=dsp[i];
            if(Math.abs(dsp[i][1]-dsp[i][0])<0.01) color=0;
            else if(Math.abs(dsp[i][1]-dsp[i][0])<(1+system.dp[0])*0.01) color=1;
            else if(result.frc[i]!=0) color=2;
            else color=3;
            plot10.data.datasets[0].backgroundColor=developColors[color];
            plot11.options.scales.xAxes[0].ticks={max:dt*i,min:dt*i-4};
            plot10.update();
            plot11.update();
            i=Math.floor((performance.now()-begin)/dt/1000);   
        } 
    },1);
}

function result2animation(data,char,dt){
    if(char==="plot30"){
        elem("progress_chap3").value=0;
    }else{
        elem("progress_chap2").className="";
        elem("progress_chap2").value=0;
    }
    if(char==="chap2"){
        elem("clough").className="invisible";
        elem("imk").className="invisible";
        elem("multi").className="invisible";    
        if(setting.system.md==12){
            char="plot20";
            elem("clough").className="";
        }else if(setting.system.md==31||setting.system.md==32){
            char="plot21";
            elem("imk").className="";
        }else if(setting.system.md==41){
            char="plot22";
            elem("multi").className="";
        } 
    }
    button_switch(char,"start");
    if(sint) clearInterval(sint);
    const plot_setting={
        type:'scatter',
        data:{
            datasets:[{
                label:"Displacement vs. Force",
                type:'line',
                lineTension:0,
                data:[data[0]],
                pointRadius:0,
                borderColor:"#000000",
                borderJoinStyle:'round',
                borderCapStyle:'round',
                fill:true,
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
    };
    if(char==="plot20"){
        if(plot20) plot20.destroy();
        plot20=new Chart(elem(char),plot_setting);
    }else if(char==="plot21"){
        if(plot21) plot21.destroy();
        plot21=new Chart(elem(char),plot_setting);
    }else if(char==="plot22"){
        if(plot22) plot22.destroy();
        plot22=new Chart(elem(char),plot_setting);
    }else if(char==="plot30"){
        if(plot30) plot30.destroy();
        plot30=new Chart(elem(char),plot_setting);
    }
    const begin=performance.now();
    let i=1;
    sint=setInterval(()=>{
        if(char==="plot30") elem("progress_chap3").value=i/(data.length-1);
        else elem("progress_chap2").value=i/(data.length-1);
        if(i>data.length-1){
            console.log(performance.now()-begin);
            if(char==="plot30"){
                plot30.data.datasets[0].fill=false;
                plot30.update();
            }else{
                if(char==="plot20"){
                    plot20.data.datasets[0].fill=false;
                    plot20.update();
                }else if(char==="plot21"){
                    plot21.data.datasets[0].fill=false;
                    plot21.update();
                }else if(char==="plot22"){
                    plot22.data.datasets[0].fill=false;
                    plot22.update();
                }
                elem("progress_chap2").className="hidden";
            }
            button_switch(char,"stop");
        }else{
            let color=0;
            if(Math.abs(data[i].x)<0.01) color=0;
            else if(Math.abs(data[i].x)<(1+setting.system.dp[0])*0.01) color=1;
            else if(data[i].y!=0) color=2;
            else color=3;
            if(char==="plot20"){
                plot20.data.datasets[0].backgroundColor=developColors[color];
                plot20.data.datasets[0].data=data.slice(0,i);
                plot20.update();
            }else if(char==="plot21"){
                plot21.data.datasets[0].backgroundColor=developColors[color];
                plot21.data.datasets[0].data=data.slice(0,i);
                plot21.update();
            }else if(char==="plot22"){
                plot22.data.datasets[0].backgroundColor=developColors[color];
                plot22.data.datasets[0].data=data.slice(0,i);
                plot22.update();
            }else if(char==="plot30"){
                plot30.data.datasets[0].backgroundColor=developColors[color];
                plot30.data.datasets[0].data=data.slice(0,i);
                plot30.update();
            }
            i=Math.floor((performance.now()-begin)/dt/1000);   
        } 
    },1);
}

function button_switch(char,order){
    if(order==="stop"){
        elem(char+"_anime").className=elem(char+"_stop").className;
        elem(char+"_stop").className="invisible";
        elem("progress_chap2").className="hidden";
        clearInterval(sint);
    }else if(order==="start"){
        for(const key of ["chap1","plot20","plot21","plot22","plot30"]){
            if(elem(key+"_stop").className!=="invisible"){
                elem(key+"_anime").className=elem(key+"_stop").className;
                elem(key+"_stop").className="invisible";   
            }
        } 
        elem(char+"_stop").className=elem(char+"_anime").className;
        elem(char+"_anime").className="invisible";
    }
}

function setting2cyclic(){
    const system=vector(setting.system);
    let property=system_property(system);
    let hyst=property.hyst[0];
    if(!hyst.du) hyst.du=[0,(system.du[0]+system.dp[0]+system.dpc[0]+1)*hyst.dy];
    let result={dsp:[[],[]],frc:[[0],[0]]};
    for(let t=0; t<600*0.08/hyst.dy*system.h[0]; t++) result.dsp[0].push(Math.floor(2+t/300)*Math.sin(t*Math.PI/100)*hyst.dy/2);
    for(let i=0; i<0.08*system.h[0]; i+=hyst.dy/100) result.dsp[1].push(i);
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
            borderColor:metroColors[1+2*idx],
            borderJoinStyle:'round',
            borderCapStyle:'round',
        };
        const system=vector(setting.system);
        const property=system_property(system);
        const hyst=property.hyst[0];
        let hctrl=property.hctrl[0];
        hctrl.ss=property.ss[0];
        hctrl.ff=0;
        for(let i=0; i<val.length-1; i++){
            hctrl=restoring_force(hctrl.ss,val[i],val[i+1],hctrl.ff,hyst,hctrl);
            result.frc[idx][i+1]=hctrl.ff;
            datasets[idx].data[i+1]={x:val[i+1]/system.h,y:hctrl.ff/system.My};
        }
    });
    cyclic_data={
        data:datasets[0].data,
        dt:0.001,
    }
    return datasets;
}

function showHyste(char){
    const datasets=setting2cyclic();
    const plot_setting={
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
    };
    if(char==="plot20"){
        if(plot20) plot20.destroy();
        plot20=new Chart(elem(char),plot_setting);
    }else if(char==="plot21"){
        if(plot21) plot21.destroy();
        plot21=new Chart(elem(char),plot_setting);
    }else if(char==="plot22"){
        if(plot22) plot22.destroy();
        plot22=new Chart(elem(char),plot_setting);
    }
}

function Chapter3(){
    elem("progress_chap3").value=0;
    const system=vector(setting.system);
    let control=setting.control;
    control.amp=Number(elem("num_chap3").value);
    if(!control.amp||control.amp===0){
        control.amp=1.0;
        elem("num_chap3").value="1.0";
    }
    elem("range_chap3").value=elem("num_chap3").value;
    const result=sdf(system,ga,control);
    chap3table.push(["<tr><th>",String(chap3table.length),".</th><td>",ga.name,"</td><td>",String(control.amp),"</td><td>",result.collapse,"</td></tr>"].join(""));
    let table3=chap3table.map(val=>val);
    table3.unshift("<table class=table_result>");
    table3.push("</table>");
    elem("table_chap3").innerHTML=table3.join("");
    setting.control.amp=0.6;
    const data=result.dsp.map((val,idx)=>{return {x:val/system.h[0],y:result.frc[idx]/system.My[0]}});
    result2animation(data,"plot30",ga.dt);
}

function Chapter4(){
    elem("progress_chap4").value=0;
    let n=Number(elem("num_chap4").value);
    if(!n||n===0){
        n=5;
        elem("num_chap4").value="5";
    }
    elem("range_chap4").value=elem("num_chap4").value;
    console.log(n);
    const perbegin=performance.now();
    if(sint) clearInterval(sint);
    if(sint42) clearInterval(sint42);
    const system=vector(setting.system);
    let control=setting.control;
    const gmset=gm_random(n);
    const plot_Setting={
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
            legend:false,
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        max:0.15,
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
    };
    if(plot40) plot40.destroy();
    plot40=new Chart(elem("plot40"),plot_Setting);
    const sdfida=async(gm,idx,system,control,plot)=>{
        control.tend=gm.dt*gm.acc.length;
        plot.data.datasets[idx]={
            //label:gm.name,
            type:'line',
            lineTension:0,
            data:[{x:0,y:0}],
            fill:false,
            borderColor:metroColors[idx%metroColors.length],
            borderWidth:2,
            pointBackgroundColor:metroColors[idx%metroColors.length],
        };
        let supamp=5.8,supdef=0,itr=0,infamp=0;   
        const interv1=()=>new Promise(resolve=>{ 
            sint=setInterval(()=>{
                control.amp=0.2+itr*0.1;
                if(control.amp>5.0){
                    console.log("too large amp",control.amp);
                    clearInterval(sint);
                }
                const result=sdf(system,gm,control);
                const defmax=result.dsp.reduce((acc,val)=>Math.max(Math.abs(acc),Math.abs(val)),0)/system.h[0];
                if(defmax>0.15||result.collapse==="Collapse"){
                    supamp=control.amp;
                    supdef=defmax;
                    resolve();
                    clearInterval(sint);
                }else{
                    infamp=control.amp;
                    plot.data.datasets[idx].data.push({x:defmax,y:control.amp});
                    plot.update();  
                    itr++;          
                }
            },1);
        });
        const interv2=()=>new Promise(resolve=>{
            sint42=setInterval(()=>{
                if(0.001>Math.abs(supamp-infamp)){
                    resolve();
                    clearInterval(sint42);
                }else{
                    control.amp=(infamp+supamp)/2;
                    const result=sdf(system,gm,control);
                    const defmax=result.dsp.reduce((acc,val)=>Math.max(Math.abs(acc),Math.abs(val)),0)/system.h[0];
                    if(defmax>0.15||result.collapse==="Collapse"){
                        supamp=control.amp;
                        supdef=defmax;
                    }else{
                        infamp=control.amp;
                        plot.data.datasets[idx].data.push({x:defmax,y:control.amp});
                        plot.update(); 
                        itr++;          
                    }
                }
            },1);
        });
        const interv3=()=>new Promise(resolve=>{
            plot.data.datasets[idx].data.push({x:supdef,y:supamp});
            console.log(supdef);
            if(supamp>plot.options.scales.yAxes[0].ticks.max-0.1) plot.options.scales.yAxes[0].ticks.max=supamp+0.1;
            plot.update();
            resolve(supamp);
        });
        await interv1();
        await interv2();
        return await interv3();
    }
    const start=async ()=>{
        let idx=0,ampdict={};
        for(const val of gmset){
            ampdict[val.name]=await sdfida(val,idx,system,control,plot40);
            console.log(val.name);
            elem("progress_chap4").value=(idx+1)/gmset.length;
            console.log(performance.now()-perbegin);
            idx++;
        }
        return ampdict;
    }
    start().then((ampdict)=>{
        const amparr=Object.keys(ampdict).map(key=>ampdict[key]);
        const mean=sum(amparr)/amparr.length;
        chap4table.push([
            "<tr><th>",
            String(gmset.length),
            "</th><td>",
            mean.toFixed(3),
            "</td><td>",
            Math.sqrt(sum(amparr.map(val=>(val-mean)**2))/amparr.length).toFixed(3),
            "</td></tr>"
        ].join(""));
        let table4=chap4table.map(val=>val);
        table4.unshift("<table class=table_result>");
        table4.push("</table>");
        elem("table_chap4").innerHTML=table4.join("");
        setting.control.amp=0.6;
        const system=renamer(setting.system);
        let no_change=true;
        idaresult.forEach((val)=>{
            if(system_compare(val.system,system)){
                val.amp=Object.assign(val.amp,ampdict);
                no_change=false;
            }
        });
        if(no_change){
            idaresult.push({
                amp:ampdict,
                system:system,
            });   
        }
        ida_res2table();
    });
}

function ida_res2table(){
    deleteSample();
    const button_list=idaresult.map((val,idx)=>{
        const arr=Object.keys(val.amp);
        const mean=sum(arr.map(key=>val.amp[key]))/arr.length;
        let button=[
            "Setting",
            String(idx),
            ", NoGM*: ",
            String(arr.length),
            ", MCA*: ",
            String(mean.toFixed(3)),
            ", StD*: ",
            String(Math.sqrt(sum(arr.map(key=>(val.amp[key]-mean)**2))/arr.length).toFixed(3)),
            
        ].join("");
        let table=[];
        if(val.system.md==12){
            const keylist=["Mode","as","se"];
            table=["md","au","se"].map((key,i)=>"<tr><td>"+keylist[i]+"</td><th>"+String(val.system[key])+"</th></tr>");
        }else if(val.system.md==31){
            const keylist=["Mode","as","dpc","Res","ls","lc","lk","la","dt0","se","dc","du"];
            table=["md","as","dpc","Res","ls","lc","lk","la","dt0","se","dp","ddu"].map((key,i)=>"<tr><td>"+keylist[i]+"</td><th>"+String(val.system[key])+"</th></tr>");
        }else if(val.system.md==32){
            const keylist=["Mode","as","dpc","Res","ls","lc","lk","la","dt0","F-pin","se","dc","du","D-pin"];
            table=["md","as","dpc","Res","ls","lc","lk","la","dt0","Fpr","se","dp","ddu","Ap"].map((key,i)=>"<tr><td>"+keylist[i]+"</td><th>"+String(val.system[key])+"</th></tr>");
        }else if(val.system.md==41){
            const keylist=["Mode","Λ,Λk","F-pin","d0,d1...","f0,f1...","D-pin"];
            table=["md","lambda","Fpr","disp","force","Ap"].map((key,i)=>"<tr><td>"+keylist[i]+"</td><th>"+String(val.system[key])+"</th></tr>");
        };
        table.push("</table></div>");
        table=table.join("");
        return ["res","temp","Setting"].map(key=>{
            if(key==="Setting"){
                let amparr=arr.map(k=>val.amp[k]);
                amparr.sort();
                let data=amparr.map((v,i)=>{return {x:v,y:(i+1)/arr.length}});
                data.unshift({x:Math.min(...amparr)-0.001,y:0});
                return {
                    label:key+String(idx),
                    type:"line",
                    lineTension:0,
                    pointRadius:3,
                    fill:false,
                    borderColor:metroColors[idx%metroColors.length],
                    borderWidth:2,
                    pointBackgroundColor:metroColors[idx%metroColors.length],
                    data:data,
                };
            }else{
                return [
                    "<div class='div_result'><button class='result border6' onclick='ida_res_button(this);' id=",
                    key,
                    String(idx),
                    ">",
                    button,
                    "</button>",
                    "<br>",
                    "<a class='a_left' onclick='return openclose(this);' href=#",
                    "table_",
                    key,
                    String(idx),
                    ">See Description</a>",
                    "<a class='a_right' onclick='return result_delete(this);' href=#",
                    "setting",
                    String(idx),
                    ">Delete</a><table class=invisible id=table_",
                    key,
                    String(idx),
                    ">",
                    table,
                ].join("");
            }
        });
    });
    elem("table_chap5").innerHTML=button_list.map(val=>val[0]+"<br>").join("");
    elem("template").innerHTML=button_list.map(val=>val[1]).join("");
    if(plot50) plot50.destroy();
    plot50=new Chart(elem("plot50"),{
        type:"scatter",
        data:{
            datasets:button_list.map(val=>val[2]),
        },
        options:{
            animation:false,
            scales:{
                xAxes:[{
                    ticks:{
                        min:0.0,
                    },
                }],
                yAxes:[{
                    ticks:{
                        max:1.0,
                        min:0.0,
                    },
                }],
            },
        },
    });
    createSample();
}

function ida_res_button(btn){
    const char=btn.getAttribute("id");
    if(char.startsWith("temp")){
        setting.system=renamer(idaresult[Number(char[4])].system);
        setting2slider();
    }else if(char.startsWith("res")){
        let meta=plot50.data.datasets[Number(char[3])]._meta;
        const idx=Object.keys(meta)[0];
        if(meta[idx].hidden===true) meta[idx].hidden=false;
        else meta[idx].hidden=true;
        plot50.update();
    }
}

function result_delete(btn){
    const num=Number(btn.getAttribute("href")[8]);
    let confirm=window.confirm("このデータを削除します。よろしいですか？");
    if(confirm){
        idaresult.splice(num,1);
        ida_res2table();
    }
    return false;
}

function system_compare(system1,system2){
    let result=false;
    if(system1.md[0]===system2.md[0]){
        if(system1.md[0]===12){
            result=["au","se"].every(key=>{
                return (system1[key][0]===system2[key][0]);
            });
        }else if(system1.md[0]===31||system1.md[0]===32){
            result=["se","as","Res","dt0","ddu","ls","lc","la","lk","dp","dpc"].every(key=>{
                return (system1[key][0]===system2[key][0]);
            });
            if(result===true&&system1.md[0]===32){
                result=["Ap","Fpr"].every(key=>{
                    return (system1[key][0]===system2[key][0]);
                }); 
            }
        }else if(system1.md==41){
            result=["lambda","disp","force","Ap","Fpr"].every(key=>{
                if(key==="Ap"||key==="Fpr") return (system1[key][0]===system2[key][0]);
                else return system1[key].every((val,idx)=>(val===system2[key][idx]));
            }); 
        }
    }
    return result;
}


/* Analysis Function */
const sum=(arr)=>arr.reduce((acc,cur)=>acc+=cur);
function ones(row,col,num){
    let b=[];
    for(let i=0; i<row; i++){
        let a=[];
        for(let j=0; j<col; j++) a[j]=num;
        b[i]=a;
    }
    return b;
}

function renamer(hctrl){
    let hctrl1={};
    for(key in hctrl){
        if(key==="energy") hctrl1[key]=hctrl[key].map(val=>val.map(v=>v));
        else{
            if(Array.isArray(hctrl[key])) hctrl1[key]=hctrl[key].map(val=>val);
            else hctrl1[key]=hctrl[key];
        }
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
        la:372,
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
        lambda:[100,100],
        disp:[0.01,0.03,0.132],
        force:[1.0,1.02,0],
    };
    let control={
        amp:0.6,
        ampinit:0.4,
        amplast:1.7  
    };
    system.My  =        Ai(system.ms,system.h);
    system.dpc =     (1+system.as*system.dp)/system.ac;
    system.ddu  =        0;
    system.du=(1+system.dp+system.dpc+system.ddu);
    system.se  = system.My.map((v,i)=>v/system.h[i]/0.01);
    system.fy=system.My;
    system.au=system.as;
    if(Nst===1){
        system.ms=system.ms[0];
        system.h=system.h[0];
        system.My=system.My[0];
        system.se=system.se[0];
        system.fy=system.fy[0];
    }
    return {
        system:system,
        control:control,
    };
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
        if(!keylist.includes(key)&&system[key].length===undefined) system[key]=ones(1,system.Nst,system[key])[0];
    }
    return system
}

function system_property(system){
    let hyst=[], hctrl=[];
    let property={
        Nst:system.Nst,
        ms:system.ms,
        bm:system.hm,
        bk:system.hk,
        ss:system.se.map(val=>val),
    };
    system.md.forEach((val,idx)=>{
        hctrl[idx]={};
        if(val===2){
            hyst[idx]={
                md:val,
                se:system.se[idx],
                b0:system.b0[idx],
            };
        }else if(10<val&&val<20){
            hyst[idx]={
                md:val,
                se:system.se[idx],
                fy:system.fy[idx],
                dy:system.fy[idx]/system.se[idx],
            };
            switch(val){
                case 11:
                case 12:
                    hyst[idx].su=hyst[idx].se*system.au[idx];
                    hyst[idx].sy=hyst[idx].se;
                case 13:
                    hyst[idx].b0=system.b0[idx];
                default: ;
            }
        }else if(20<val&&val<29){
            hyst[idx]={
                md:val,
                se:system.se[idx]/system.ay[idx],
                fc:system.fc[idx],
                fy:system.fy[idx],
                dc:system.fc[idx]/system.se[idx],
                dy:system.fy[idx]/system.se[idx]/system.ay[idx],
                su:system.se[idx]*system.aui[idx],
            };
            hyst[idx].scy=(hyst[idx].fy-hyst[idx].fc)/(hyst[idx].dy-hyst[idx].dc);
            switch(val){
                case 25:
                    hyst[idx].b2=system.b2[idx];
                    hyst[idx].b3=system.b3[idx];
                case 24:
                    hyst[idx].b0=system.b0[idx];
                    hyst[idx].b1=system.b1[idx];
                default: ;
            }
        }else if(30<val&&val<40){
            system.du[idx]=(system.dp[idx]+system.dpc[idx]+system.ddu[idx]+1);
            hyst[idx]={
                md:val,
                My:system.My[idx],
                sy:system.se[idx],
                dy:system.My[idx]/system.se[idx],
                as:system.as[idx],
                Res:system.Res[idx],
                ls:system.ls[idx],
                lc:system.lc[idx],
                la:system.la[idx],
                lk:system.lk[idx],
                cs:system.cs[idx],
                cc:system.cc[idx],
                ca:system.ca[idx],
                ck:system.ck[idx],
                D:system.D[idx],
            };
            hyst[idx].dp=system.dp[idx]*hyst[idx].dy;
            hyst[idx].dpc=system.dpc[idx]*hyst[idx].dy;
            hyst[idx].du=system.du[idx]*hyst[idx].dy;
            hyst[idx].dt0=system.dt0[idx]*hyst[idx].dy;
            if(val>31){
                hyst[idx].Fpr=system.Fpr[idx];
                hyst[idx].Ap=system.Ap[idx];
            }
            for(const key of ["as","My","dp","dpc","Res","du","dt0","D","Fpr"]){
                if(!isNaN(hyst[idx][key])){
                    if(["as","Res","D","Fpr"].includes(key)) hyst[idx][key]=[hyst[idx][key],hyst[idx][key]];
                else hyst[idx][key]=[-hyst[idx][key],hyst[idx][key]];        
                }
            }
            hctrl[idx]={
                ll:1,
                fi:0,
                fri:0,
                ksi:0,
                kui:0,
                dti:0,
                e:[0,0],
                ek:[0],
                dm:0,
                fm:0,
                d1:0,
                f1:0,
                d2:0,
                d1f:0,
                np:0,
                df:0,
                dy:0,
            };
        }else if(val===41){
            hyst[idx]={
                md:val,
                lambda:system.lambda,
                Ap:system.Ap[idx],
                Fpr:system.Fpr[idx],
                disp:system.disp.map(val=>val*system.h[idx]),
                force:system.force.map(val=>val*system.My[idx]),
            };
            hyst[idx].disp.push(10);
            hyst[idx].force.push(0);
            hyst[idx].dy=hyst[idx].disp[0];
            hyst[idx].du=Math.max(...hyst[idx].disp)/hyst[idx].dy+system.ddu[idx];
            system.du[idx]=hyst[idx].du;
            hctrl[idx]={
                rule_number:1,
                ff:0,
                ss:0,
                force_hyst:[],
                disp_hyst:[],
                unl_stiff:0,
                energy:[],
                yield_energy:0,
                rel_tar_disp:[0,0],
                rel_tar_force:[0,0],
                unl_tar_disp:0,
                unl_init:[0,0],
                pole:0,
            };
        }
        hctrl[idx]=Object.assign(hctrl[idx],{
            ll:1,
            fm:[0,0],
            dm:[0,0],
            s1:[0,0],
            s2:[0,0],
            f0:0,
            f1:0,
            f2:0,
            f3:0,
            f4:0,
            f5:0,
            f6:0,
            f7:0,
            f8:0,
            d0:0,
            d1:0,
            d2:0,
            d3:0,
            d4:0,
            d5:0,
            d6:0,
            d7:0,
            d8:0,
            x0:0,
            x1:0,
            x2:0,
            x3:0,
        });
    });
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
        case 41:
            hctrl=multi_hysteresis(ds,dd,fs,ss,hyst,hctrl);
            break;
        default:console.log("error");
    }
    return hctrl;
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
        let err=0,hctrl_amp={};
        for(let j=0;j<5;j++){
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
        }
        hctrl=renamer(hctrl_amp);
        if(hctrl.ll===0){
            collapse="Collapse";
            break;
        }
    }
    return {
        t:t,
        gacc:gacc,
        acc:absacc,
        vel:vel,
        dsp:dsp,
        dct:dct,
        frc:frc,
        collapse:collapse,
    };
}

var setting=setter(1);

var slider={
    imk:elem("imk_disp_slider"),
    multi:elem("multi_disp_slider"),
};

for(const key in slider){
    noUiSlider.create(slider[key],{
        start:[1,3],
        step:0.2,
        margin:0.2,
        range:{
            min:0.2,
            max:15,
        },
    });
}
slider.imk.noUiSlider.on("update",(values)=>{
    setting.system.se=setting.system.My[0]/setting.system.h[0]/Number(values[0])*100;
    setting.system.dp=Number(values[1])/Number(values[0])-1;
    showHyste("plot21");
});
slider.multi.noUiSlider.on("update",(values)=>{
    setting.system.disp=values.map(val=>Number(val)/100);
    showHyste("plot22");
});

function addHandle(){
    if(setting.system.disp.length<7){
        setting.system.force.push(0);
        setting.system.disp.push(setting.system.disp[setting.system.disp.length-1]+0.01);
        setting2slider();
    }else console.log("too many handles");
}

function removeHandle(){
    if(setting.system.disp.length>2){
        setting.system.force.pop();
        setting.system.disp.pop();
        setting2slider();
    }else console.log("Number of handles can't be less than 2.");
}

var ver = 1, dbName="collapse", storeName="idaresult", key_id=1;
var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.mozIDBTransaction;
var db = null;

function createSample(){
    let openRequest = indexedDB.open(dbName, ver);
    openRequest.onupgradeneeded = function(e){
        console.log("create-upgradeneeded");
        db = openRequest.result;
        db.createObjectStore(storeName, { "keyPath": "id" });
        console.log(db.objectStoreNames);
    }
    openRequest.onsuccess = function(e) {
        db = openRequest.result;
        let addRequest = db.transaction(storeName, "readwrite").objectStore(storeName).put({
            id:key_id,
            result:idaresult,
        });
        addRequest.onsuccess=function(){
            console.log("Success");
        }
        addRequest.onerror = function(err){
            console.log(err.message);
        }
    }           
    openRequest.onerror = function(err){console.log(err.message)}
    openRequest.onblocked=function(err){console.log("blocked")}
}

function getSample() {
    let openRequest=indexedDB.open(dbName,ver);
    db=null;
    openRequest.onsuccess=function(e){
        db=openRequest.result;
        if(db.objectStoreNames.length>0){
            const transaction = db.transaction([storeName], IDBTransaction.READ_ONLY);
            let getRequest = transaction.objectStore(storeName).get(key_id);
            getRequest.onsuccess = function(e){
                idaresult=getRequest.result.result;
                if(idaresult) ida_res2table();
                else console.log("Not Found");
            }
            getRequest.onerror=function(e){console.log(e)}
        }else{
            console.log("db none");
            db.close();
            deleteSample();
        }   
    }
    openRequest.onerror=function(e){console.log(e)}
}

function deleteSample() {
    if(db) db.close();
    var deleteRequest = indexedDB.deleteDatabase(dbName);
    deleteRequest.onsuccess=function(e){
        console.log("Deleted in Successful");
    }
    deleteRequest.onerror = function(err){
        console.log(err.message);
    }
    deleteRequest.onblocked=function(e){
        console.log("There is a severe error, I hope you don't get this message.");
    }
}

getSample();
