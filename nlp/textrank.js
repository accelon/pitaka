/*TextRank Paper http://web.eecs.umich.edu/~mihalcea/papers/mihalcea.emnlp04.pdf*/
const textRank=function(backwardLinks,forwardLinks) {
    /*
    backwardLinks = {x:["a","c"], y:["a","b","c"]}
    forwardLinks  = {"a":["x","y"], b:["y"],c:["x","y"]}
    */
	const MAXITER=50,     //最多迭代次數
      MINDIFF=0.001,   //收歛閥值, 小於這個差異就不再迭代
      DAMPING=0.85     //阻尼系數。damping factor，沿用Google PageRank
                       //此系數不能超過1，越接近1，收歛的速度越慢

	var score={}; //上一次迭代每個詞的分數
	var iter=0;//迭代次數

    let now={}; //此次迭代每個詞的分數

	while (iter<MAXITER){
	  let max_diff=0; //此次迭代最大的差異
      
		for (var term in backwardLinks) { //遍歷每一個詞
			now[term]=1-DAMPING;           //一開始所有term的基本分是 1-d 

            if (backwardLinks[term].length<2) continue;
			for (var i=0;i<backwardLinks[term].length;i++) { // 遍歷key的相鄰詞
                const child=backwardLinks[term][i];
 
                let childcount=forwardLinks[child] && forwardLinks[child].length;
                if (!childcount) childcount=1;

				const vote_to_term    = score[child]||(1-DAMPING);
				const vote_importance =  vote_to_term / childcount ;
				//根據PageRank 不按超連結而離開此網頁的機率是0.15
				//因此投給相鄰詞的機率最多剩下的85%
				//累加到term的得分 （阻尼牛頓收歛法 Damping Newton's Method）
				now[term] += DAMPING * vote_importance ;
                // if (term=='七覺支') console.log(term,now[term],child,vote_importance)
			} 
			//與上次迭代的差異
            
			const score_diff=Math.abs(now[term] - score[term]);
	 		max_diff = Math.max(max_diff, score_diff);
	  }
	 	iter++;
	  score=now; //保存此次成果
	  if (max_diff <= MINDIFF) { //沒有比 MINDIFF 更大的差異，無須再迭代
	   	console.log('迭代次數',iter,max_diff,MINDIFF);
	   	break;
	  }
	}
	var out=[];
	for (var key in score) out.push([key,score[key],backwardLinks[key]]);
	out.sort((a,b)=>b[1]-a[1]); 
	return out;
}

export {textRank}