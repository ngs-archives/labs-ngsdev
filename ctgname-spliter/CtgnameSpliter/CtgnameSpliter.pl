package MT::Plugin::CtgNameSpliter;
use strict;

use vars qw( $VERSION );
$VERSION = '1.0';

use MT;
use MT::Template::Context;
use MT::Util qw(decode_html encode_xml);
use HTTP::Response;
use HTTP::Request::Common;


if ( MT->version_number >= 3 ) {
	require MT::Plugin;

	my $plugin = new MT::Plugin();

	#$plugin->description( '' ); 
	$plugin->doc_link( 'http://test.ngsdev.org/ctgname-spliter/' );

	if ( MT->version_number >= 3.2 ) {
		$plugin->name( 'MT-CategoryNameSpliter' );
		$plugin->version( $VERSION  );
		$plugin->author_name( 'atsushi nagase' );
		$plugin->author_link( 'http://ngsdev.org/' ); 
	} else {
		$plugin->name( 'MT-CategoryNameSpliter, v' . $VERSION );
	}
	MT->add_plugin( $plugin );
}


sub splitus {
	my $spl = $_[1] ? $_[1] : /\,/;
	my @a = split($spl,$_[0]);
	return split($spl,$_[0]);
}

sub splctgname {
	my($ctx, $args, $cond) = @_;
	my $splt = $args->{glue} ? $args->{glue} : ':';
	my $cat = ($_[0]->stash('category') || $_[0]->stash('archive_category') || _hdlr_category_label(@_)) 
		or return $_[0]->error(MT->translate(
			"You used an [_1] tag outside of the proper context.", '<$MTCategoryID$>'
		));
	my @a = splitus($cat->label,$splt);
	return $a[1] ? $a[1] : $a[0];
}

sub splbfore {
	my($ctx, $args, $cond) = @_;
	my $splt = $args->{glue} ? $args->{glue} : ':';
	my $cat = ($_[0]->stash('category') || $_[0]->stash('archive_category') || _hdlr_category_label(@_)) 
		or return $_[0]->error(MT->translate(
			"You used an [_1] tag outside of the proper context.", '<$MTCategoryID$>'
		));
	my @a = splitus($cat->label,$splt);
	return $a[0];
}


MT::Template::Context->add_tag( SplitUnderscore => \&splitus );
MT::Template::Context->add_tag( SplitCategoryName => \&splctgname );
MT::Template::Context->add_tag( SplitBeforeGlue => \&splbfore );


1;