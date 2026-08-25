const $ = (id) => document.getElementById(id);
const mensagem = $('mensagem');
const botao = $('enviar');

function mascaraCnpj(v){const d=v.replace(/\D/g,'').slice(0,14);return d.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2')}
function mascaraTelefone(v){const d=v.replace(/\D/g,'').slice(0,11);return d.length>10?d.replace(/^(\d{2})(\d{5})(\d{0,4})/,'($1) $2-$3'):d.replace(/^(\d{2})(\d{4})(\d{0,4})/,'($1) $2-$3')}
$('cnpj').addEventListener('input',e=>e.target.value=mascaraCnpj(e.target.value));
['telefone','whatsapp'].forEach(id=>$(id).addEventListener('input',e=>e.target.value=mascaraTelefone(e.target.value)));
$('cep').addEventListener('input',e=>{const d=e.target.value.replace(/\D/g,'').slice(0,8);e.target.value=d.replace(/^(\d{5})(\d)/,'$1-$2')});
$('uf').addEventListener('input',e=>e.target.value=e.target.value.replace(/[^a-z]/gi,'').toUpperCase().slice(0,2));

async function obterDocumentos(){
    const resposta=await fetch('/publico/documentos-legais');
    const docs=await resposta.json();
    const termos=docs.find(d=>d.tipo==='TERMOS_USO');
    const privacidade=docs.find(d=>d.tipo==='POLITICA_PRIVACIDADE');
    if(!termos||!privacidade){botao.disabled=true;mensagem.textContent='O cadastro está temporariamente indisponível.';return}
    $('versaoTermos').textContent=`(versão ${termos.versao})`;
    $('versaoPrivacidade').textContent=`(versão ${privacidade.versao})`;
}

$('formCadastro').addEventListener('submit',async(evento)=>{
    evento.preventDefault();mensagem.className='mensagem';mensagem.textContent='';
    if($('senha').value!==$('confirmacaoSenha').value){mensagem.textContent='As senhas não coincidem.';$('confirmacaoSenha').focus();return}
    botao.disabled=true;
    const valor=(id)=>$(id).value.trim();
    const body={empresa:{nome:valor('nome'),nomeFantasia:valor('nomeFantasia'),cnpj:valor('cnpj'),email:valor('emailEmpresa'),telefone:valor('telefone'),whatsapp:valor('whatsapp'),logradouro:valor('logradouro'),numeroEndereco:valor('numeroEndereco'),complemento:valor('complemento'),bairro:valor('bairro'),cidade:valor('cidade'),uf:valor('uf'),cep:valor('cep')},administrador:{nome:valor('nomeAdmin'),email:valor('emailAdmin'),senha:$('senha').value},aceitouTermos:$('aceitouTermos').checked,aceitouPrivacidade:$('aceitouPrivacidade').checked};
    try{const r=await fetch('/publico/cadastros',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.mensagem||'Não foi possível concluir o cadastro.');mensagem.className='mensagem sucesso';mensagem.textContent=d.exigeAtivacaoEmail?'Cadastro recebido. Verifique seu e-mail para ativar a conta.':'Cadastro concluído. Você já pode entrar no ComDoc.';$('formCadastro').querySelectorAll('input,button').forEach(c=>c.disabled=true);setTimeout(()=>location.href=d.exigeAtivacaoEmail?`/confirmar-email?email=${encodeURIComponent(d.email)}`:'/login',1800)}catch(e){mensagem.textContent=e.message;botao.disabled=false;mensagem.scrollIntoView({behavior:'smooth',block:'center'})}
});
obterDocumentos().catch(()=>{botao.disabled=true;mensagem.textContent='Não foi possível carregar os documentos legais.'});
