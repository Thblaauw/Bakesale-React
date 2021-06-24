import { registerRootComponent } from 'expo';
import React from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import DealList from './DealList';
import DealDetail from './DealDetail';
import SearchBar from './SearchBar';
import ajax from '../ajax';

class App extends React.Component{
    titleXPos = new Animated.Value(0);

    animateTitle = (direction = 1) => {
        const width = Dimensions.get('window').width - 150;
        Animated.timing(
            this.titleXPos,
            {
                toValue: direction * width/2, 
                duration: 1000,
                easing: Easing.ease,
            }
        ).start(({finished}) => {
            if(finished){
                this.animateTitle(-1 * direction)
            }
        });
    }

    async componentDidMount(){
        this.animateTitle();
        const deals = await ajax.fetchInitialDeals();
        this.setState((prevState) => {
            return {deals};
        });
    }

    state = {
        deals: [],
        dealsFromSearch: [],
        currentDealId: null,
    }

    searchDeals = async (searchTerm) => {
        let dealsFromSearch = [];
        if(searchTerm){
            dealsFromSearch = await ajax.fetchDealsSearchResults(searchTerm)
        }
        this.setState({dealsFromSearch})
    };

    setCurrentDeal = (dealId) => {
        this.setState((prevState) => ({
            currentDealId: dealId
        }));
    };

    unsetCurrentDeal = () => {
        this.setState((prevState) => ({
            currentDealId: null
        }));
    };

    currentDeal = () => {
        return this.state.deals.find(
            (deal) => deal.key === this.state.currentDealId
        );
    };

    render() {
        console.log(this.state.dealsFromSearch)
        if(this.state.currentDealId){
            return (
            <View style={styles.main}>
                <DealDetail 
                initialDealData={this.currentDeal()} 
                    onBack={this.unsetCurrentDeal}
                />
            </View>)
        }

        const dealsToDisplay = this.state.dealsFromSearch.length > 0
                                ? this.state.dealsFromSearch
                                : this.state.deals

        if(dealsToDisplay.length > 0){
            return (
            <View style={styles.main}>
                <SearchBar searchDeals={this.searchDeals}/>
                <DealList deals={dealsToDisplay}
                        onItemPress={this.setCurrentDeal}/> 
            </View>)
        }

        return (
            <Animated.View style={[{left:this.titleXPos },styles.container]}> 
                <Text style={styles.header}>Dummy SSS</Text>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent:'center',
        alignItems: 'center',
    },

    main:{
        marginTop: 30,
    },

    header: {
        fontSize: 40,
    }
});

registerRootComponent(App);