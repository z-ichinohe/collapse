function clough(last_disp,new_disp,last_force,ss,hyst,hctrl){
    let dy=hyst.dy, fy=hyst.fy, sy=hyst.sy, su=hyst.su, b0=hyst.b0;
    let ll=hctrl.ll, s1=hctrl.s1, d0=hctrl.d0, x0=hctrl.x0, x1=hctrl.x1, fm=hctrl.fm, dm=hctrl.dm, new_force=hctrl.new_force;
    let is=0, sn=0;
    if(!isNaN(dy)){
        dy=[-dy,dy];
        fy=[-fy,fy];
    }
    if(last_force<0){
        is=0;
        sn=-1;
    }else{
        is=1;
        sn=1;
    }
    switch(ll){
        case 1:
            if(new_disp<0){
                is=0;
                sn=-1;
            }
            else{
                is=1;
                sn=1;
            }
            if((dy[is]-new_disp)*sn>0) new_force=sy*new_disp;
            else{
                dm=dy;
                fm=fy;
                s1=[sy,sy];
                ll=2;
                ss=su;
                new_force=fy[is]+(new_disp-dy[is])*su;
            }
            break;
        case 2:
            if((new_disp-last_disp)*sn>0) new_force=fy[is]+su*(new_disp-dy[is]);
            else{
                dm[is]=last_disp;
                fm[is]=last_force;
                s1[is]=sy*(dy[is]/dm[is])**b0;
                x0    =last_disp-last_force/s1[is];
                if((x0-new_disp)*sn <0){
                    ll = 3;
                    ss = s1[is];
                    new_force = ss*(new_disp-x0);
                }else{
                    is = 1-is;
                    sn = -sn;
                    if((dm[is]-new_disp)*sn >0){
                        ll = 4;
                        ss = fm[is]/(dm[is]-x0);
                        new_force = ss*(new_disp-x0);
                    }else{
                        ll = 2;
                        ss = su;
                        new_force = fy[is]+su*(new_disp-dy[is]);
                    }
                }
            }
            break;
        case 3:
            if((x0-new_disp)*sn <0){
                if((dm[is]-new_disp)*sn >0) new_force = ss*(new_disp-x0);
                else{
                    ll = 2;
                    ss = su;
                    new_force = fy[is]+su*(new_disp-dy[is]);
                }
            }else{
                is = 1-is;
                sn = -sn;
                if((dm[is]-new_disp)*sn >0){
                    ll = 4;
                    ss = fm[is]/(dm[is]-x0);
                    new_force = ss*(new_disp-x0);
                }else{
                    ll = 2;
                    ss = su;
                    new_force = fy[is]+su*(new_disp-dy[is]);
                }
            }
            break;
        case 4:
            if((new_disp-last_disp)*sn >0){
                if((dm[is]-new_disp)*sn >0) new_force = ss*(new_disp-x0);
                else{
                    ll = 2;
                    ss = su;
                    new_force = fy[is]+su*(new_disp-dy[is]);
                }
            }else{
                d0 = last_disp;
                x1 = last_disp-last_force/s1[is];
                if((x1-new_disp)*sn <0){
                    ll = 5;
                    ss = s1[is];
                    new_force = ss*(new_disp-x1);
                }else{
                    is = 1-is;
                    sn = -sn;
                    x0 = x1;
                    if((dm[is]-new_disp)*sn >0){
                        ll = 4;
                        ss = fm[is]/(dm[is]-x0);
                        new_force = ss*(new_disp-x0);
                    }else{
                        ll = 2;
                        ss = su;
                        new_force = fy[is]+su*(new_disp-dy[is]);
                    }
                }
            }
            break;
        case 5:
            if((x1-new_disp)*sn <0){
                if((d0-new_disp)*sn >0) new_force = ss*(new_disp-x1);
                else{
                    if((dm[is]-new_disp)*sn >0){
                        ll = 4;
                        ss = fm[is]/(dm[is]-x0);
                        new_force = ss*(new_disp-x0);
                    }else{
                        ll = 2;
                        ss = su;
                        new_force = fy[is]+su*(new_disp-dy[is]);
                    }
                }
            }else{
                is = 1-is;
                sn = -sn;
                x0 = x1;
                if((dm[is]-new_disp)*sn >0){
                    ll = 4;
                    ss = fm[is]/(dm[is]-x0);
                    new_force = ss*(new_disp-x0);
                }else{
                    ll = 2;
                    ss = su;
                    new_force = fy[is]+su*(new_disp-dy[is]);
                }
            }
            break;
        default:console.log("ll=6");
    }
    return {
        ll:ll,
        s1:s1,
        d0:d0,
        x0:x0,
        x1:x1,
        fm:fm,
        dm:dm,
        ss:ss,
        ff:new_force,
    };
}

function imk_peak_o(last_disp,new_disp,last_force,ss,hyst,hctrl){
    let ll=hctrl.ll, new_force=0;
    const sy=hyst.sy, as=hyst.as, My=hyst.My, dp=hyst.dp, dpc=hyst.dpc, Res=hyst.Res, du=hyst.du, dt0=hyst.dt0;
    const dy=My.map(val=>val/sy),dc=dy.map((v,i)=>v+dp[i]),sc=as.map(val=>val*sy),fc=My.map((v,i)=>v+sc[i]*(dc[i]-dy[i])),sr=fc.map((v,i)=>-v/dpc[i]),fr=Res.map((v,i)=>v*My[i]);
    const ls=hyst.ls, lc=hyst.lc, la=hyst.la, lk=hyst.lk, cs=hyst.cs, cc=hyst.cc, ca=hyst.ca, ck=hyst.ck, D=hyst.D, ey=(My[0]*dy[0]+My[1]*dy[1])/2;
    let fi=hctrl.fi, fri=hctrl.fri, ksi=hctrl.ksi, kui=hctrl.kui, dti=hctrl.dti, e=hctrl.e, ek=hctrl.ek, dm=hctrl.dm, fm=hctrl.fm, d1=hctrl.d1, f1=hctrl.f1;
    let res={},is=1,fb=0,bk=0,iii=0,r=0,db=NaN;
    if(ll===1){
        fi=My.map(val=>val);
        fri=fc.map((v,i)=>v-sr[i]*dc[i]);
        ksi=sc.map(val=>val);
        kui=sy;
        e=[0,0];
        ek=[0];
        fm=My.map(val=>val);
        dm=dy.map(val=>val);
        dti=[-0,0];
    }
    if(new_disp<last_disp) is=0;
    else is=1;
    di=dm.map((v,i)=>v+dti[i]);
    while(iii<10){
        iii++;
        if(new_disp===last_disp){
            new_force=last_force;
            break;
        }else if(ll===0){
            new_force=0;
            ss=0;
            break;
        }else if(!isFinite(new_disp)){
            ll=0;
            console.log("Displacement Overflow");
        }else if(ll===1){
            if(dy[0]<new_disp && new_disp<dy[1]){
                res=primary(ll,new_disp,sy,fr,sr,du,di,fi,fri,ksi);
                ll=res.ll;
                new_force=res.ff;
                ss=res.ss;
                break;
            }else{
                ll=2;
                r=1;
                if(new_disp>0) f1=-1;
                else f1=1;
                /*
                e=update_e(e,0,dy[is],last_force,My[is]);
                ek=update_e(ek,0,dy[is],last_force,My[is]);
                */
                e=update_e(e,0,dy[is],0,My[is]);
                ek=update_e(ek,0,dy[is],0,My[is]);
            }
        }else if(ll===2){
            if((new_disp-last_disp)*f1<0){
                res=primary(ll,new_disp,sy,fr,sr,du,di,fi,fri,ksi);
                ll=res.ll;
                new_force=res.ff;
                ss=res.ss;
                if(r===1){
                    e =update_e_rule2(e ,di[is],new_disp,fi[is],new_force,sr,fr,du,di,fi,fri,ksi);
                    ek=update_e_rule2(ek,di[is],new_disp,fi[is],new_force,sr,fr,du,di,fi,fri,ksi);
                }
                break;
            }else{
                ll=3;
                ei=ek[0];
                if(ei<0) ei=0;
                bk=(ei/(lk*ey-sum(e)))**ck*D[1-is];
                kui=[(1-bk)*kui,kui];
                ek.unshift(0);
                ss=kui[0];
                d1=last_disp;
                f1=last_force;
                dm[1-is]=d1;
                fm[1-is]=f1;
                fi[1-is]=f1;
            }
        }else if(ll===3){
            let d0=last_disp-last_force/ss;
            if((d1-new_disp)*(d0-new_disp)<0){
                new_force=ss*(new_disp-d0);
                break;
            }else{
                r=1;
                if((d0-new_disp)*(d0-last_disp)<=0){
                    ll=4;
                    db=d0;
                    fb=0;
                    e=update_e(e,last_disp,db,last_force,fb);
                    ek=update_e(ek,last_disp,db,last_force,fb);
                    ei=e[0]+e[1];
                    if(ei<0) ei=0;
                    if(Math.min(ls,lc,la)*ey-sum(e)<ei){
                        ll=0;
                        new_force=0;
                        ss=0;
                        console.log("Beyond Energy Capacity");
                        break;
                    }
                    if(e[1]===0) dti=dt0;
                    e.unshift(0);
                    kui=kui[0];
                    bs=(ei/(ls*ey-sum(e)))**cs*D[is];
                    bc=(ei/(lc*ey-sum(e)))**cc*D[is];
                    ba=(ei/(la*ey-sum(e)))**ca*D[is];
                    fm[is]=(1-bs)*fm[is];
                    ksi[is]=(1-bs)*ksi[is];
                    fri[is]=(1-bc)*fri[is];
                    dti[is]=(1+ba)*dti[is];
                    if(dm[is]===dy[is]) dm[is]=fm[is]/sy;
                    di=dm.map((v,i)=>v+dti[i]);
                    res=primary(ll,di[is],sy,fr,sr,du,dm,fm,fri,ksi);
                    fi[is]=res.ff;
                    ss=fi[is]/(di[is]-d0);
                    if(f1===0) f1=1-2*is;
                }else{
                    db=d1;
                    fb=f1;
                    e=update_e(e,last_disp,db,last_force,fb);
                    ek.shift();
                    kui=kui[1];
                    if(d1===dm[is]){
                        ll=2;
                        di[is]=dm[is];
                    }else{
                        ll=4;
                        ss=(fi[is]-f1)/(di[is]-d1);
                    }
                    f1=-f1;
                }
            }
        }else if(ll===4){
            if((new_disp-last_disp)*f1<0){
                if(new_disp/di[is]<1){
                    ll=4;
                    new_force=fi[is]+ss*(new_disp-di[is]);
                    if(r===1){
                        e=update_e(e,db,new_disp,fb,new_force);
                        ek=update_e(ek,db,new_disp,fb,new_force);
                    }
                    break;
                }else{
                    ll=2;
                    r=1;
                    if(isNaN(db)){
                        e=update_e(e,last_disp,di[is],last_force,fi[is]);
                        ek=update_e(ek,last_disp,di[is],last_force,fi[is]);
                    }else{
                        e=update_e(e,db,di[is],fb,fi[is]);
                        ek=update_e(ek,db,di[is],fb,fi[is]);
                    }
                }
            }else{
                ll=3;
                ei=ek[0];
                if(ei<0) ei=0;
                bk=(ei/(lk*ey-sum(e)))**ck*D[1-is];
                kui=[(1-bk)*kui,kui];
                ek.unshift(0);
                if(ss<kui[0]) ss=kui[0];
                d1=last_disp;
                f1=last_force;
            }
        }
    }
    if(r===0 && ll!=1){
        if(ll===2){
            e =update_e_rule2(e ,last_disp,new_disp,last_force,new_force,sr,fr,du,di,fi,fri,ksi);
            ek=update_e_rule2(ek,last_disp,new_disp,last_force,new_force,sr,fr,du,di,fi,fri,ksi);
        }else{
            e =update_e(e ,last_disp,new_disp,last_force,new_force);
            ek=update_e(ek,last_disp,new_disp,last_force,new_force);
        }
    }
    return {ll:ll,ff:new_force,ss:ss,fi:fi,fri:fri,ksi:ksi,kui:kui,dti:dti,e:e,ek:ek,dm:dm,fm:fm,d1:d1,f1:f1};
}

function primary(ll,new_disp,sy,fr,sr,du,di,fi,fri,ksi){
    let res={};
    res.ll=ll;
    if(ll===1){
        res.ss=sy;
        res.ff=sy*new_disp;
    }else{
        let fi1=[],dr=[],dc=[],fc=[];
        for(let k of [0,1]){
            fi1[k]=sr[k]*di[k]+fri[k];
            if(Math.abs(fi[k])>Math.abs(fi1[k])) fi[k]=fi1[k];
            dr[k]=(fr[k]-fri[k])/sr[k];
            if(Math.abs(di[k])>Math.abs(dr[k]) || Math.abs(fi[k])<Math.abs(fr[k])) fi[k]=fr[k];
            dc[k]=(ksi[k]*di[k]+fri[k]-fi[k])/(ksi[k]-sr[k]);
            fc[k]=fri[k]+sr[k]*dc[k];
        }
        if(new_disp>0) is=1;
        else is=0;
        if(Math.abs(new_disp)>Math.abs(du[is])){
            if(ll!=0) console.log("Beyond Displacement Capacity");
            res.ss=0;
            res.ff=0;
            res.ll=0;
        }else if(Math.abs(new_disp)>Math.abs(dr[is])){
            res.ss=0;
            res.ff=fr[is];
        }else if(Math.abs(new_disp)>Math.abs(dc[is])){
            res.ss=sr[is];
            res.ff=fc[is]+(new_disp-dc[is])*sr[is];
        }else{
            res.ss=ksi[is];
            res.ff=fi[is]+(new_disp-di[is])*ksi[is];
        }
    }
    return res;
}

function update_e(e,last_disp,new_disp,last_force,new_force){
    e[0]+=(new_disp-last_disp)*(new_force+last_force)/2;
    return e
}

function update_e_rule2(e,last_disp,new_disp,last_force,new_force,sr,fr,du,di,fi,fri,ksi){
    let dc=[],fc=[],dr=[],D=[last_disp],F=[last_force];
    for(let k of [0,1]){
        dc[k]=(ksi[k]*di[k]+fri[k]-fi[k])/(ksi[k]-sr[k]);
        fc[k]=fri[k]+sr[k]*dc[k];
        dr[k]=(fr[k]-fri[k])/sr[k];
    }
    if(new_disp<last_disp) is=0;
    else is=1;
    if(Math.abs(new_disp)>Math.abs(du[is])){
        new_disp=du[is];
        new_force=fr[is];
    }
    if(last_disp<dc[is]&&dc[is]<new_disp){
        D.push(dc[is]);
        F.push(fc[is]);
    }
    if(last_disp<dr[is]&&dr[is]<new_disp){
        D.push(dr[is]);
        F.push(fr[is]);
    }
    D.push(new_disp);
    F.push(new_force);
    for(let k=0; k<D.length-1; k++) e[0]+=(F[k+1]+F[k])*(D[k+1]-D[k])/2;
    return e;
}

function imk_pinching(last_disp,new_disp,last_force,ss,hyst,hctrl){
    let ll=hctrl.ll, new_force=0;
    const sy=hyst.sy,as=hyst.as,My=hyst.My,dp=hyst.dp,dpc=hyst.dpc,Res=hyst.Res,du=hyst.du,dt0=hyst.dt0;
    const dy=My.map(val=>val/sy),dc=dy.map((v,i)=>v+dp[i]),sc=as.map(val=>val*sy),fc=My.map((v,i)=>v+sc[i]*(dc[i]-dy[i])),sr=fc.map((v,i)=>-v/dpc[i]),fr=Res.map((v,i)=>v*My[i]);
    const ls=hyst.ls,lc=hyst.lc,la=hyst.la,lk=hyst.lk,cs=hyst.cs,cc=hyst.cc,ca=hyst.ca,ck=hyst.ck,D=hyst.D,Fpr=hyst.Fpr,Ap=hyst.Ap,ey=My.reduce((acc,cur,idx)=>{return acc+=cur*dy[idx]},0)/2;
    let fi=hctrl.fi,fri=hctrl.fri,ksi=hctrl.ksi,kui=hctrl.kui,dti=hctrl.dti,e=hctrl.e,ek=hctrl.ek,dm=hctrl.dm,fm=hctrl.fm,d1=hctrl.d1,f1=hctrl.f1,d2=hctrl.d2;
    let res={},is=1,fb=0,bk=0,iii=0,r=0,db=NaN;
    if(ll===1){
        fi=My.map(val=>val);
        fri=fc.map((v,i)=>v-sr[i]*dc[i]);
        ksi=sc.map(val=>val);
        kui=sy;
        e=[0,0];
        ek=[0];
        fm=My.map(val=>val);
        dm=dy.map(val=>val);
        dti=[-0,0];
        d2=NaN;
    }
    if(new_disp<last_disp) is=0;
    else is=1;
    di=dm.map((v,i)=>v+dti[i]);
    while(iii<10){
        iii++;
        if(new_disp===last_disp){
            new_force=last_force;
            break;
        }else if(ll===0){
            new_force=0;
            ss=0;
            break;
        }else if(!isFinite(new_disp)){
            ll=0;
            console.log("Displacement Overflow");
        }else if(ll===1){
            if(dy[0]<new_disp && new_disp<dy[1]){
                res=primary(ll,new_disp,sy,fr,sr,du,di,fi,fri,ksi);
                ll=res.ll;
                new_force=res.ff;
                ss=res.ss;
                break;
            }else{
                ll=2;
                r=1;
                if(new_disp>0) f1=-1;
                else f1=1;
                e=update_e(e,0,dy[is],last_force,My[is]);
                ek=update_e(ek,0,dy[is],last_force,My[is]);
            }
        }else if(ll===2){
            if((new_disp-last_disp)*f1<0){
                res=primary(ll,new_disp,sy,fr,sr,du,di,fi,fri,ksi);
                ll=res.ll;
                new_force=res.ff;
                ss=res.ss;
                if(r===1){
                    e =update_e_rule2(e ,di[is],new_disp,fi[is],new_force,sr,fr,du,di,fi,fri,ksi);
                    ek=update_e_rule2(ek,di[is],new_disp,fi[is],new_force,sr,fr,du,di,fi,fri,ksi);
                }
                break;
            }else{
                ll=3;
                ei=ek[0];
                if(ei<0) ei=0;
                bk=(ei/(lk*ey-sum(e)))**ck*D[1-is];
                kui=[(1-bk)*kui,kui];
                ek.unshift(0);
                ss=kui[0];
                d1=last_disp;
                f1=last_force;
                dm[1-is]=d1;
                fm[1-is]=f1;
                fi[1-is]=f1;
            }
        }else if(ll===3){
            let d0=last_disp-last_force/ss;
            if((d1-new_disp)*(d0-new_disp)<0){
                new_force=ss*(new_disp-d0);
                break;
            }else{
                r=1;
                if((d0-new_disp)*(d0-last_disp)<0){
                    ll=5;
                    db=d0;
                    fb=0;
                    e=update_e(e,last_disp,db,last_force,fb);

                    ek=update_e(ek,last_disp,db,last_force,fb);
                    ei=e[0]+e[1];
                    if(ei<0) ei=0;
                    if(Math.min(ls,lc,la)*ey-sum(e)<ei){
                        ll=0;
                        new_force=0;
                        ss=0;
                        console.log("Beyond Energy Capacity");
                        break;
                    }
                    if(e[1]===0) dti=dt0;
                    e.unshift(0);
                    kui=kui[0];
                    bs=(ei/(ls*ey-sum(e)))**cs*D[is];
                    bc=(ei/(lc*ey-sum(e)))**cc*D[is];
                    ba=(ei/(la*ey-sum(e)))**ca*D[is];
                    fm[is]=(1-bs)*fm[is];
                    ksi[is]=(1-bs)*ksi[is];
                    fri[is]=(1-bc)*fri[is];
                    dti[is]=(1+ba)*dti[is];
                    if(dm[is]===dy[is]) dm[is]=fm[is]/sy;
                    di=dm.map((v,i)=>v+dti[i]);
                    res=primary(ll,di[is],sy,fr,sr,du,dm,fm,fri,ksi);
                    fi[is]=res.ff;
                    ss=Ap*fi[is]/(di[is]-d0);
                    d2=d0;
                    if(f1===0) f1=1-2*is;
                }else{
                    db=d1;
                    fb=f1;
                    e=update_e(e,last_disp,db,last_force,fb);
                    ek.shift();
                    kui=kui[1];
                    if(d1===dm[is]){
                        ll=2;
                        di[is]=dm[is];
                    }else if(isNaN(d2)){
                        ll=4;
                        ss=(fi[is]-f1)/(di[is]-d1);
                    }else{
                        ll=5;
                        ss=f1/(d1-d2);
                    }
                    f1=-f1;
                }
            }
        }else if(ll===4){
            if((new_disp-last_disp)*f1<0){
                if(new_disp/di[is]<1){
                    new_force=fi[is]+ss*(new_disp-di[is]);
                    if(r===1){
                        e=update_e(e,db,new_disp,fb,new_force);
                        ek=update_e(ek,db,new_disp,fb,new_force);
                    }
                    break;
                }else{
                    ll=2;
                    r=1;
                    if(isNaN(db)){
                        e=update_e(e,last_disp,di[is],last_force,fi[is]);
                        ek=update_e(ek,last_disp,di[is],last_force,fi[is]);
                    }else{
                        e=update_e(e,db,di[is],fb,fi[is]);
                        ek=update_e(ek,db,di[is],fb,fi[is]);
                    }
                }
            }else{
                ll=3;
                ei=ek[0];
                if(ei<0) ei=0;
                bk=(ei/(lk*ey-sum(e)))**ck*D[1-is];
                kui=[(1-bk)*kui,kui];
                ek.unshift(0);
                if(ss<kui[0]) ss=kui[0];
                d1=last_disp;
                f1=last_force;
                //dm2[1-is]=d1;
                //fi2[1-is]=f1;
            }
        }else if(ll===5){
            const f3=Fpr[is]*fi[is], d3=d2+f3/ss;
            if((new_disp-last_disp)*f1<0){
                if((d3-new_disp)*(d3-last_disp)>0){
                    new_force=ss*(new_disp-d2);
                    if(r===1){
                        e=update_e(e,db,new_disp,fb,new_force);
                        ek=update_e(ek,db,new_disp,fb,new_force);
                    }
                    break;
                }else{
                    ll=4;
                    r=1;
                    ss=(fi[is]-f3)/(di[is]-d3);
                    d2=NaN;
                    if(isNaN(db)){
                        e=update_e(e,last_disp,d3,last_force,f3);
                        ek=update_e(ek,last_disp,d3,last_force,f3);
                    }else{
                        e=update_e(e,db,d3,last_force,f3);
                        ek=update_e(ek,db,d3,fb,f3);
                    }
                    db=d3;
                    fb=f3;
                }
            }else{
                ll=3;
                ei=ek[0];
                if(ei<0) ei=0;
                bk=(ei/(lk*ey-sum(e)))**ck*D[1-is];
                kui=[(1-bk)*kui,kui];
                ek.unshift(0);
                if(ss<kui[0]) ss=kui[0];
                d1=last_disp;
                f1=last_force;
            }
        }
    }
    if(r===0 && ll!=1){
        if(ll===2){
            e =update_e_rule2(e ,last_disp,new_disp,last_force,new_force,sr,fr,du,di,fi,fri,ksi);
            ek=update_e_rule2(ek,last_disp,new_disp,last_force,new_force,sr,fr,du,di,fi,fri,ksi);
        }else{
            e =update_e(e ,last_disp,new_disp,last_force,new_force);
            ek=update_e(ek,last_disp,new_disp,last_force,new_force);
        }
    }
    return {
        ll:ll,
        ff:new_force,
        ss:ss,
        fi:fi,
        fri:fri,
        ksi:ksi,
        kui:kui,
        dti:dti,
        e:e,
        ek:ek,
        dm:dm,
        fm:fm,
        d1:d1,
        f1:f1,
        d2:d2
    };
}

const update_e_multi=(last_disp,new_disp,last_force,new_force)=>(new_force+last_force)*(new_disp-last_disp)/2;

function primary_multi(new_disp,force_hyst,disp_hyst){
    let new_force=0, stiff=0;
    disp_hyst.forEach((val,idx)=>{
        if(Math.abs(new_disp)>=val){
            if(idx===disp_hyst.length-1){
                stiff=(force_hyst[idx]-force_hyst[idx-1])/(disp_hyst[idx]-disp_hyst[idx-1]);
                if(new_disp<0) new_force=stiff*(new_disp+val)-force_hyst[idx];
                else new_force=stiff*(new_disp-val)+force_hyst[idx];
            }else{
                stiff=(force_hyst[idx+1]-force_hyst[idx])/(disp_hyst[idx+1]-disp_hyst[idx]);
                if(new_disp<0) new_force=stiff*(new_disp+val)-force_hyst[idx];
                else new_force=stiff*(new_disp-val)+force_hyst[idx];
            }
        }
    });
    return {new_force:new_force,stiff:stiff};
}

function multi_hysteresis(last_disp,new_disp,last_force,stiff,hyst,hctrl){
    let is=0;
    if(last_disp<new_disp) is=1;
    const lambda=hyst.lambda, Ap=hyst.Ap, Fpr=hyst.Fpr;
    let new_force=0, rule_change=false;
    let rule_number=hctrl.ll, rel_tar_disp=hctrl.rel_tar_disp, rel_tar_force=hctrl.rel_tar_force,unl_tared_disp=hctrl.unl_tared_disp,unl_init=hctrl.unl_init;
    let disp_hyst=hctrl.disp_hyst, force_hyst=hctrl.force_hyst, unl_stiff=hctrl.unl_stiff, energy=hctrl.energy, yield_energy=hctrl.yield_energy,pole=hctrl.pole;
    if(rule_number===1){
        disp_hyst=hyst.disp.map(val=>val);
        force_hyst=hyst.force.map(val=>val);
        stiff=force_hyst[0]/disp_hyst[0];
        unl_stiff=[stiff,stiff];
        yield_energy=disp_hyst[0]*force_hyst[0];
        energy=[[0],[0]];
        rel_tar_force=[-hyst.force[0],hyst.force[0]];
        rel_tar_disp=[-hyst.disp[0],hyst.disp[0]];
    }
    for(let iterator=0;iterator<10;iterator++){
        if(last_disp===new_disp){
            new_force=last_force;
            break;
        }else if(rule_number===0){
            new_force=0;
            stiff=0;
            break;
        }else if(last_force===0&&stiff===0||new_disp>10){
            rule_number=0;
            console.log("Beyond Ultimate Displacement")
        }else if(!isFinite(new_disp)){
            rule_number=0;
            console.log("Displacement Overflow");
        }else if(rule_number===1){
            if(Math.abs(new_disp)<disp_hyst[0]){
                rule_number=1;
                stiff=force_hyst[0]/disp_hyst[0];
                new_force=new_disp*stiff;
                break;
            }else{
                rule_change=true;
                rule_number=2;
                pole=last_force;
                energy[0][0]+=update_e_multi(0,disp_hyst[0],0,force_hyst[0]);
                energy[1][0]+=update_e_multi(0,disp_hyst[0],0,force_hyst[0]);
            }
        }else if(rule_number===2){
            if((new_disp-last_disp)*new_disp>0){
                const result=primary_multi(new_disp,force_hyst,disp_hyst);
                new_force=result.new_force;
                pole=new_force;
                stiff=result.stiff;
                if(rule_change){
                    energy[0][0]+=update_e_multi(rel_tar_disp[is],new_disp,rel_tar_force[is],new_force);
                    energy[1][0]+=update_e_multi(rel_tar_disp[is],new_disp,rel_tar_force[is],new_force);
                }
                break;
            }else{
                rule_number=3;
                let step_energy=energy[1][0];
                if(step_energy<0) step_energy=0;
                let b=(step_energy/(lambda[1]*yield_energy-sum(energy[1])));
                if(b<0) b=0;
                energy[1].unshift(0);
                unl_stiff[0]*=(1-b);
                stiff=unl_stiff[0];
                rel_tar_disp[1-is]=last_disp;
                rel_tar_force[1-is]=last_force;
                unl_init=[last_disp,last_force];
                pole*=-1;
            }
        }else if(rule_number===3){
            const unl_tar_disp=last_disp-last_force/stiff;
            if((unl_init[0]-new_disp)*(unl_tar_disp-new_disp)<0){
                new_force=stiff*(new_disp-unl_tar_disp);
                pole=-new_force;
                break;
            }else{
                if((unl_tar_disp-new_disp)*(unl_tar_disp-last_disp)<0){
                    rule_number=5;
                    rule_change=true;
                    energy[0][0]+=update_e_multi(rel_tar_disp[1-is],unl_tar_disp,rel_tar_force[1-is],0);
                    energy[1][0]+=update_e_multi(rel_tar_disp[1-is],unl_tar_disp,rel_tar_force[1-is],0);
                    let step_energy=energy[0][0];
                    if(step_energy<0) step_energy=0;
                    if(lambda[0]*yield_energy-sum(energy)<step_energy){
                        rule_number=0;
                        new_force=0;
                        stiff=0;
                        console.log("Beyond Energy Capacity");
                        break;
                    }
                    const b=(step_energy/(lambda[0]*yield_energy-sum(energy[0])));    
                    //console.log(energy[0].length);
                    force_hyst=force_hyst.map(val=>val*(1-b));
                    disp_hyst=disp_hyst.map(val=>val*(1-b));
                    energy[0].unshift(0);
                    const result=primary_multi(rel_tar_disp[is],force_hyst,disp_hyst);
                    rel_tar_force[is]=result.new_force;
                    unl_tared_disp=unl_tar_disp;
                    disp_hyst.forEach((val,idx)=>{
                        if(Math.abs(rel_tar_disp[is])>val&&val>Math.abs(unl_tar_disp)&&rel_tar_force[is]/(rel_tar_disp[is]-unl_tar_disp)>force_hyst[idx]/(val-unl_tar_disp*(2*is-1))){
//                            console.log(force_hyst[idx],val,rel_tar_force[is],rel_tar_disp[is],unl_tar_disp);
                            rel_tar_disp[is]=val*(2*is-1);
                            rel_tar_force[is]=force_hyst[is]*(2*is-1);
                        }
                    });
                    stiff=Ap*rel_tar_force[is]/(rel_tar_disp[is]-unl_tar_disp);
//                    if(stiff<0) console.log(rel_tar_force[is],rel_tar_disp[is]);
                    unl_stiff[1]=unl_stiff[0];
                }else{
                    //energy[1].shift();
                    unl_stiff[0]=unl_stiff[1];
                    pole*=-1;
                    if(rel_tar_disp[is]===unl_init[0]){
                        rule_number=2;
                        rule_change=true;
                    }else if(Math.abs(unl_init[1])>Math.abs(rel_tar_force[is]*Fpr)){
                        rule_number=4;
                        rule_change=true;
                        stiff=(rel_tar_force[is]-unl_init[1])/(rel_tar_disp[is]-unl_init[0]);
                    }else{
                        rule_number=5;
                        rule_change=true;
                        stiff=(Ap*rel_tar_force[is]-unl_init[1])/(rel_tar_disp[is]-unl_init[0]);//Ap
                    }
                }
            }
        }else if(rule_number===4){
            if((new_disp-last_disp)*last_force>0||rule_change){
                if(new_disp/rel_tar_disp[is]<1){
                    new_force=rel_tar_force[is]+stiff*(new_disp-rel_tar_disp[is]);
                    pole=new_force;
                    if(rule_change){
                        const pin_tar_force=Fpr*rel_tar_force[is], pin_tar_disp=rel_tar_disp[is]-(rel_tar_force[is]-pin_tar_force)/stiff;
                        energy[0][0]+=update_e_multi(pin_tar_disp,new_disp,pin_tar_force,new_force);
                        energy[1][0]+=update_e_multi(pin_tar_disp,new_disp,pin_tar_force,new_force);
                    }
                    break;
                }else{
                    rule_change=true;
                    rule_number=2;
                    energy[0][0]+=update_e_multi(last_disp,rel_tar_disp[is],last_force,rel_tar_force[is]);
                    energy[1][0]+=update_e_multi(last_disp,rel_tar_disp[is],last_force,rel_tar_force[is]);
                }
            }else{
                rule_number=3;
                let step_energy=energy[1][0];
                if(step_energy<0) step_energy=0;
                let b=(step_energy/(lambda[1]*yield_energy-sum(energy[1])));
                if(b<0) b=0;
                energy[1].unshift(0);
                unl_stiff[0]*=(1-b);
                if(unl_stiff[0]>stiff) stiff=unl_stiff[0];
                unl_init=[last_disp,last_force];
                pole*=-1;
            }
        }else if(rule_number===5){
            const pin_tar_force=Fpr*rel_tar_force[is], pin_tar_disp=unl_tared_disp+pin_tar_force/stiff;
            let reg_is=-1;
            if(last_force>=0) reg_is=1;
            //console.log(((new_disp-last_disp)*reg_is<0||rule_change)===((new_disp-last_disp)*pole>0));
            if((new_disp-last_disp)*pole>0){
                if((pin_tar_disp-new_disp)*(pin_tar_disp-last_disp)>0){
                    new_force=pin_tar_force-(pin_tar_disp-new_disp)*stiff;
                    pole=new_force;
                    if(rule_change){
                        energy[0][0]+=update_e_multi(unl_tared_disp,new_disp,0,new_force);
                        energy[1][0]+=update_e_multi(unl_tared_disp,new_disp,0,new_force);
                    }
                    break;
                }else{
                    rule_change=true;
                    rule_number=4;
                    stiff=(rel_tar_force[is]-pin_tar_force)/(rel_tar_disp[is]-pin_tar_disp);
                    energy[0][0]+=update_e_multi(last_disp,pin_tar_disp,last_force,pin_tar_force);
                    energy[1][0]+=update_e_multi(last_disp,pin_tar_disp,last_force,pin_tar_force);
                }
            }else{
                rule_number=3;
                let step_energy=energy[1][0];
                if(step_energy<0) step_energy=0;
                let b=(step_energy/(lambda[1]*yield_energy-sum(energy[1])));
                if(b<0) b=0;
                energy[1].unshift(0);
                unl_stiff[0]*=(1-b);
                stiff=unl_stiff[0];
                if(stiff>unl_stiff[0]) console.log("too little unl_stiff");
                unl_init=[last_disp,last_force];
                pole*=-1;
            }
        }
    }
    if(!rule_change&& rule_number!==1 && rule_number!==3){
        energy[0][0]+=update_e_multi(last_disp,new_disp,last_force,new_force);
        energy[1][0]+=update_e_multi(last_disp,new_disp,last_force,new_force);
    }
    return {
        ll:rule_number,
        ff:new_force,
        ss:stiff,
        force_hyst:force_hyst,
        disp_hyst:disp_hyst,
        unl_stiff:unl_stiff,
        energy:energy,
        yield_energy:yield_energy,
        rel_tar_disp:rel_tar_disp,
        rel_tar_force:rel_tar_force,
        unl_tared_disp:unl_tared_disp,
        unl_init:unl_init,
        pole:pole,
    };
}
