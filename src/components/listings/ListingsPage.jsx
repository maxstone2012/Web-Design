import React from 'react';
import { withRouter } from 'react-router-dom';

import Header from '../Header';
import Breadcrumb from '../Breadcrumb';
import Filters from './Filters';
import Listing from './Listing';
import Pagination from 'rc-pagination';
import Footer from '../Footer';

import { getListingsByFilter } from '../../requester';

class ListingsPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            listings: null,
            listingLoading: true,
            currentPage: 1,
            totalItems: 0
        };

        this.updateParamsMap = this.updateParamsMap.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
    }

    componentDidMount() {
        if (this.props.location.search) {
            let searchTerms = this.getSearchTerms();
            getListingsByFilter(searchTerms + `&page=${this.state.currentPage - 1}`).then(data => {
                this.setState({ listings: data.content, listingLoading: false, totalItems: data.totalElements })
            });
        }
        else {
            this.props.history.push("/");
        }
    };

    componentWillMount() {
        if (this.props.location.search) {
            this.paramsMap = this.getParamsMap();
        }
    };

    handleSearch(e) {
        e.preventDefault();
        let searchTerms = this.getSearchTerms();
        getListingsByFilter(searchTerms).then(data => {
            this.setState({ 
                listings: data.content, 
                listingLoading: false,
                totalItems: data.totalElements,
            })
        });

        let url = `/listings/?${searchTerms}`;
        this.props.history.push(url);
    }

    getSearchTerms() {
        let keys = Array.from(this.paramsMap.keys());
        let pairs = [];
        for (let i = 0; i < keys.length; i++) {
            pairs.push(keys[i] + '=' + this.createParam(this.paramsMap.get(keys[i])));
        }

        return pairs.join('&');
    }

    getParamsMap() {
        const map = new Map();
        const pairs = this.props.location.search.substr(1).split('&');
        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i].split('=');
            map.set(pair[0], this.parseParam(pair[1]));
        }

        if (!map.has('priceMin')) {
            map.set('priceMin', '100');
        }

        if (!map.has('priceMax')) {
            map.set('priceMax', '5000');
        }

        return map;
    };

    updateParamsMap(key, value) {
        if (!value || value === '') {
            this.paramsMap.delete(key);
        } else {
            this.paramsMap.set(key, this.createParam(value));
        }
    }

    parseParam(param) {
        return param.split('%20').join(' ');
    };

    createParam(param) {
        return param.split(' ').join('%20');
    }

    onPageChange = (page) => {
        this.setState({
            currentPage: page,
        })

        let searchTerms = this.getSearchTerms();
        getListingsByFilter(searchTerms + `&page=${page - 1}`).then(data => {
            this.setState({ 
                listings: data.content, 
                listingLoading: false, 
                totalItems: data.totalElements 
            })
        });
    }

    componentWillUnmount() {
        this.setState({
            listings: null, listingLoading: true,
            currentPage: 1,
            totalItems: 0
        })
    }

    render() {
        if (this.state.listingLoading) {
            return <div className="loader"></div>;
        }

        let listings = this.state.listings;
        let hasListings = listings.length > 0 && listings[0].hasOwnProperty('defaultDailyPrice');
        return (
            <div>
                <Header paramsMap={this.paramsMap} updateParamsMap={this.updateParamsMap} handleSearch={this.handleSearch} />
                <Breadcrumb />
                <section id="hotel-box">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-3">
                                <Filters paramsMap={this.paramsMap} updateParamsMap={this.updateParamsMap} handleSearch={this.handleSearch} />
                            </div>
                            <div className="col-md-9">
                                <div className="list-hotel-box" id="list-hotel-box">

                                    {hasListings ? this.state.listings.map((item, i) => {
                                        return <Listing key={i} listing={item} currency={this.props.currency} currencySign={this.props.currencySign} />
                                    }) : <div className="text-center"><h3>No results</h3></div>}

                                    {hasListings &&
                                        <div className="pagination-box">
                                            {this.state.totalItems !== 0 && <Pagination className="pagination" defaultPageSize={20} onChange={this.onPageChange} current={this.state.currentPage} total={this.state.totalItems} />}
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }
}

export default withRouter(ListingsPage);