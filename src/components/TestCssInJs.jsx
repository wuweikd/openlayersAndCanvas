import styled from "styled-components";

const Wrapper = styled.section`
    padding: 20px;
    background: lightcoral;
  `
const Title = styled.h1`
    font-size: 1.5em;
    text-align: center;
    color: #61dafb;
`
const Button = styled.button`
    border-radius: 10px;
    padding: 20px;
    color: red;
    border: none;
    margin: 20px;
`
const ButtonSon = styled(Button)`
    background: lawngreen\;
`


function TestCssInJs() {
    return (
        <div className="App">
            <header className="App-header">
                <Wrapper>
                    <Title>
                        测试styled-components
                    </Title>
                    <Button>父button</Button>
                    <ButtonSon>继承的button</ButtonSon>
                </Wrapper>
            </header>
        </div>
    );
}

export default TestCssInJs;
